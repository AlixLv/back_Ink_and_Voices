import app from '../../index';
import { describe, beforeAll, afterAll, beforeEach, expect, it } from 'vitest';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const dbUrl = process.env.TEST_DATABASE;
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

const ownerEmail = 'owner-v2@example.com';
const otherEmail = 'other-v2@example.com';
const adminEmail = 'admin-v2@example.com';
const deleteMeEmail = 'deleteme-v2@example.com';
const plainPassword = 'password12345';
const testAuthor = 'Autrice V2 Test';

let ownerId: string;
let typeId: number;
let pendingBookId: number;
let validatedBookId: number;

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
    await prisma.book_validation.deleteMany({ where: { book: { author: testAuthor } } });
    await prisma.theme_book.deleteMany({ where: { book: { author: testAuthor } } });
    await prisma.book.deleteMany({ where: { author: testAuthor } });
    await prisma.user.deleteMany({
        where: { email: { in: [ownerEmail, otherEmail, adminEmail, deleteMeEmail] } },
    });
    await prisma.type.deleteMany({ where: { type_name: { in: ['GenreProposeTest'] } } });
    await prisma.theme.deleteMany({ where: { theme_name: { in: ['ThemeProposeTest'] } } });
}

beforeAll(async () => {
    await app.ready();
    await cleanup();

    const hashed = await argon2.hash(plainPassword);
    const owner = await prisma.user.create({
        data: { email: ownerEmail, username: 'ownerv2', password: hashed, role: 'user' },
    });
    ownerId = owner.id;
    await prisma.user.create({
        data: { email: otherEmail, username: 'otherv2', password: hashed, role: 'user' },
    });
    await prisma.user.create({
        data: { email: adminEmail, username: 'adminv2', password: hashed, role: 'admin' },
    });

    const type = await prisma.type.upsert({
        where: { type_name: 'V2Type' },
        update: {},
        create: { type_name: 'V2Type' },
    });
    typeId = type.id;
});

afterAll(async () => {
    await cleanup();
});

beforeEach(async () => {
    await prisma.book_validation.deleteMany({ where: { book: { author: testAuthor } } });
    await prisma.theme_book.deleteMany({ where: { book: { author: testAuthor } } });
    await prisma.book.deleteMany({ where: { author: testAuthor } });

    const pending = await prisma.book.create({
        data: {
            title: 'Suggestion Modifiable',
            author: testAuthor,
            publishing_house: 'Maison V2',
            short_description: 'description',
            type_id: typeId,
            user_id: ownerId,
        },
    });
    pendingBookId = pending.id;

    const validated = await prisma.book.create({
        data: {
            title: 'Suggestion Déjà Validée',
            author: testAuthor,
            publishing_house: 'Maison V2',
            short_description: 'description',
            status: 'validated',
            type_id: typeId,
            user_id: ownerId,
        },
    });
    validatedBookId = validated.id;
});

describe('POST /api/types and /api/themes', () => {
    it('returns 401 without cookie', async () => {
        const response = await app.inject({
            method: 'POST',
            url: 'api/types',
            headers: { cookie: 'access_token=' },
            payload: { type_name: 'GenreProposeTest' },
        });
        expect(response.statusCode).toBe(401);
    });

    it('creates a type then rejects the duplicate with 409', async () => {
        const cookie = await loginAndGetCookie(ownerEmail);
        const created = await app.inject({
            method: 'POST',
            url: 'api/types',
            headers: { cookie },
            payload: { type_name: 'GenreProposeTest' },
        });
        expect(created.statusCode).toBe(201);
        expect(created.json().type_name).toBe('GenreProposeTest');

        const duplicate = await app.inject({
            method: 'POST',
            url: 'api/types',
            headers: { cookie },
            payload: { type_name: 'GenreProposeTest' },
        });
        expect(duplicate.statusCode).toBe(409);
    });

    it('creates a theme then rejects the duplicate with 409', async () => {
        const cookie = await loginAndGetCookie(ownerEmail);
        const created = await app.inject({
            method: 'POST',
            url: 'api/themes',
            headers: { cookie },
            payload: { theme_name: 'ThemeProposeTest' },
        });
        expect(created.statusCode).toBe(201);

        const duplicate = await app.inject({
            method: 'POST',
            url: 'api/themes',
            headers: { cookie },
            payload: { theme_name: 'ThemeProposeTest' },
        });
        expect(duplicate.statusCode).toBe(409);
    });
});

describe('PUT /api/books/:id', () => {
    const updatePayload = {
        title: 'Suggestion Corrigée',
        author: testAuthor,
        publishing_house: 'Maison V2 Corrigée',
        short_description: 'description corrigée',
        type_id: 0,
    };

    it('returns 401 without cookie', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `api/books/${pendingBookId}`,
            headers: { cookie: 'access_token=' },
            payload: { ...updatePayload, type_id: typeId },
        });
        expect(response.statusCode).toBe(401);
    });

    it('returns 403 when not the owner', async () => {
        const cookie = await loginAndGetCookie(otherEmail);
        const response = await app.inject({
            method: 'PUT',
            url: `api/books/${pendingBookId}`,
            headers: { cookie },
            payload: { ...updatePayload, type_id: typeId },
        });
        expect(response.statusCode).toBe(403);
    });

    it('returns 409 when the suggestion is no longer pending', async () => {
        const cookie = await loginAndGetCookie(ownerEmail);
        const response = await app.inject({
            method: 'PUT',
            url: `api/books/${validatedBookId}`,
            headers: { cookie },
            payload: { ...updatePayload, type_id: typeId },
        });
        expect(response.statusCode).toBe(409);
    });

    it('updates an own pending suggestion', async () => {
        const cookie = await loginAndGetCookie(ownerEmail);
        const response = await app.inject({
            method: 'PUT',
            url: `api/books/${pendingBookId}`,
            headers: { cookie },
            payload: { ...updatePayload, type_id: typeId },
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        expect(body.title).toBe('Suggestion Corrigée');

        const dbBook = await prisma.book.findUniqueOrThrow({ where: { id: pendingBookId } });
        expect(dbBook.publishing_house).toBe('Maison V2 Corrigée');
        expect(dbBook.status).toBe('pending');
    });
});

describe('DELETE /api/books/:id', () => {
    it('returns 403 when not the owner', async () => {
        const cookie = await loginAndGetCookie(otherEmail);
        const response = await app.inject({
            method: 'DELETE',
            url: `api/books/${pendingBookId}`,
            headers: { cookie },
        });
        expect(response.statusCode).toBe(403);
    });

    it('returns 409 when the suggestion is no longer pending', async () => {
        const cookie = await loginAndGetCookie(ownerEmail);
        const response = await app.inject({
            method: 'DELETE',
            url: `api/books/${validatedBookId}`,
            headers: { cookie },
        });
        expect(response.statusCode).toBe(409);
    });

    it('deletes an own pending suggestion', async () => {
        const cookie = await loginAndGetCookie(ownerEmail);
        const response = await app.inject({
            method: 'DELETE',
            url: `api/books/${pendingBookId}`,
            headers: { cookie },
        });
        expect(response.statusCode).toBe(200);

        const dbBook = await prisma.book.findUnique({ where: { id: pendingBookId } });
        expect(dbBook).toBeNull();
    });
});

describe('Admin users management', () => {
    it('returns 403 on GET /api/users for a non-admin', async () => {
        const cookie = await loginAndGetCookie(ownerEmail);
        const response = await app.inject({
            method: 'GET',
            url: 'api/users',
            headers: { cookie },
        });
        expect(response.statusCode).toBe(403);
    });

    it('lists accounts for an admin', async () => {
        const cookie = await loginAndGetCookie(adminEmail);
        const response = await app.inject({
            method: 'GET',
            url: 'api/users',
            headers: { cookie },
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        const owner = body.find((u: { email: string }) => u.email === ownerEmail);
        expect(owner.role).toBe('user');
        expect(owner.contributions_count).toBe(2);
    });

    it('promotes then demotes a user', async () => {
        const cookie = await loginAndGetCookie(adminEmail);
        const promoted = await app.inject({
            method: 'PATCH',
            url: `api/users/${ownerId}/role`,
            headers: { cookie },
            payload: { role: 'admin' },
        });
        expect(promoted.statusCode).toBe(200);
        expect(promoted.json().role).toBe('admin');

        const demoted = await app.inject({
            method: 'PATCH',
            url: `api/users/${ownerId}/role`,
            headers: { cookie },
            payload: { role: 'user' },
        });
        expect(demoted.statusCode).toBe(200);
        expect(demoted.json().role).toBe('user');
    });

    it('refuses changing your own role with 409', async () => {
        const cookie = await loginAndGetCookie(adminEmail);
        const admin = await prisma.user.findUniqueOrThrow({ where: { email: adminEmail } });
        const response = await app.inject({
            method: 'PATCH',
            url: `api/users/${admin.id}/role`,
            headers: { cookie },
            payload: { role: 'user' },
        });
        expect(response.statusCode).toBe(409);
    });
});

describe('DELETE /api/users/me', () => {
    it('returns 401 without cookie', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: 'api/users/me',
            headers: { cookie: 'access_token=' },
        });
        expect(response.statusCode).toBe(401);
    });

    it('deletes the account and its suggestions', async () => {
        const hashed = await argon2.hash(plainPassword);
        const user = await prisma.user.create({
            data: { email: deleteMeEmail, username: 'deletemev2', password: hashed },
        });
        await prisma.book.create({
            data: {
                title: 'Suggestion À Effacer',
                author: testAuthor,
                publishing_house: 'Maison V2',
                short_description: 'description',
                type_id: typeId,
                user_id: user.id,
            },
        });

        const cookie = await loginAndGetCookie(deleteMeEmail);
        const response = await app.inject({
            method: 'DELETE',
            url: 'api/users/me',
            headers: { cookie },
        });
        expect(response.statusCode).toBe(200);

        const dbUser = await prisma.user.findUnique({ where: { email: deleteMeEmail } });
        expect(dbUser).toBeNull();
        const dbBooks = await prisma.book.findMany({ where: { user_id: user.id } });
        expect(dbBooks).toHaveLength(0);
    });
});
