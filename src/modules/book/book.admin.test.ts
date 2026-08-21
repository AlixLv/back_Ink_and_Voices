import app from '../../index';
import { describe, beforeAll, afterAll, beforeEach, expect, it } from 'vitest';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const dbUrl = process.env.TEST_DATABASE;
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

const adminEmail = 'admin-validation@example.com';
const userEmail = 'user-validation@example.com';
const plainPassword = 'password12345';

let typeId: number;
let bookId: number;

async function loginAndGetCookie(email: string) {
    const loginResponse = await app.inject({
        method: 'POST',
        url: 'api/auth/login',
        payload: { email, password: plainPassword },
    });
    const cookieHeader = loginResponse.headers['set-cookie'];
    const rawCookie = (Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader) ?? '';
    const token = rawCookie.split(';')[0]?.split('=').slice(1).join('=');
    return 'access_token=' + token;
}

async function cleanup() {
    await prisma.book_validation.deleteMany({
        where: { book: { author: 'Autrice Admin Test' } },
    });
    await prisma.book.deleteMany({
        where: { author: 'Autrice Admin Test' },
    });
    await prisma.user.deleteMany({
        where: { email: { in: [adminEmail, userEmail] } },
    });
}

beforeAll(async () => {
    await app.ready();
    await cleanup();

    const hashed = await argon2.hash(plainPassword);
    await prisma.user.create({
        data: { email: adminEmail, username: 'adminvalidation', password: hashed, role: 'admin' },
    });
    await prisma.user.create({
        data: { email: userEmail, username: 'uservalidation', password: hashed, role: 'user' },
    });

    const type = await prisma.type.upsert({
        where: { type_name: 'TestType' },
        update: {},
        create: { type_name: 'TestType' },
    });
    typeId = type.id;
});

afterAll(async () => {
    await cleanup();
});

beforeEach(async () => {
    await prisma.book_validation.deleteMany({
        where: { book: { author: 'Autrice Admin Test' } },
    });
    await prisma.book.deleteMany({
        where: { author: 'Autrice Admin Test' },
    });
    const book = await prisma.book.create({
        data: {
            title: 'Livre En Attente',
            author: 'Autrice Admin Test',
            publishing_house: 'Maison Test',
            short_description: 'description de test',
            type_id: typeId,
            user_id: (await prisma.user.findUniqueOrThrow({ where: { email: userEmail } })).id,
        },
    });
    bookId = book.id;
});

describe('GET /api/books/pending', () => {
    it('returns 401 without cookie', async () => {
        const response = await app.inject({
            method: 'GET',
            url: 'api/books/pending',
            headers: { cookie: 'access_token=' },
        });
        expect(response.statusCode).toBe(401);
    });

    it('returns 403 for a non-admin user', async () => {
        const cookie = await loginAndGetCookie(userEmail);
        const response = await app.inject({
            method: 'GET',
            url: 'api/books/pending',
            headers: { cookie },
        });
        expect(response.statusCode).toBe(403);
    });

    it('returns the pending books for an admin', async () => {
        const cookie = await loginAndGetCookie(adminEmail);
        const response = await app.inject({
            method: 'GET',
            url: 'api/books/pending',
            headers: { cookie },
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body)).toBe(true);
        expect(body.some((b: { id: number }) => b.id === bookId)).toBe(true);
    });
});

describe('PATCH /api/books/:id/validate', () => {
    it('returns 401 without cookie', async () => {
        const response = await app.inject({
            method: 'PATCH',
            url: `api/books/${bookId}/validate`,
            headers: { cookie: 'access_token=' },
            payload: { status: 'validated' },
        });
        expect(response.statusCode).toBe(401);
    });

    it('returns 403 for a non-admin user', async () => {
        const cookie = await loginAndGetCookie(userEmail);
        const response = await app.inject({
            method: 'PATCH',
            url: `api/books/${bookId}/validate`,
            headers: { cookie },
            payload: { status: 'validated' },
        });
        expect(response.statusCode).toBe(403);
    });

    it('returns 400 for an invalid status', async () => {
        const cookie = await loginAndGetCookie(adminEmail);
        const response = await app.inject({
            method: 'PATCH',
            url: `api/books/${bookId}/validate`,
            headers: { cookie },
            payload: { status: 'archived' },
        });
        expect(response.statusCode).toBe(400);
    });

    it('returns 404 for an unknown book', async () => {
        const cookie = await loginAndGetCookie(adminEmail);
        const response = await app.inject({
            method: 'PATCH',
            url: 'api/books/999999/validate',
            headers: { cookie },
            payload: { status: 'validated' },
        });
        expect(response.statusCode).toBe(404);
    });

    it('validates a book and records the decision', async () => {
        const cookie = await loginAndGetCookie(adminEmail);
        const response = await app.inject({
            method: 'PATCH',
            url: `api/books/${bookId}/validate`,
            headers: { cookie },
            payload: { status: 'validated', comment: 'Très bon choix' },
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        expect(body).toEqual({ id: bookId, status: 'validated', comment: 'Très bon choix' });

        const updatedBook = await prisma.book.findUniqueOrThrow({ where: { id: bookId } });
        expect(updatedBook.status).toBe('validated');

        const validation = await prisma.book_validation.findFirst({ where: { book_id: bookId } });
        expect(validation?.status).toBe('validated');
        expect(validation?.comment).toBe('Très bon choix');
    });

    it('refuses a book and records the decision', async () => {
        const cookie = await loginAndGetCookie(adminEmail);
        const response = await app.inject({
            method: 'PATCH',
            url: `api/books/${bookId}/validate`,
            headers: { cookie },
            payload: { status: 'refused' },
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        expect(body.status).toBe('refused');

        const updatedBook = await prisma.book.findUniqueOrThrow({ where: { id: bookId } });
        expect(updatedBook.status).toBe('refused');
    });
});
