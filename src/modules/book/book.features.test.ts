import app from '../../index';
import { describe, beforeAll, afterAll, expect, it } from 'vitest';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const dbUrl = process.env.TEST_DATABASE;
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

const adminEmail = 'admin-features@example.com';
const userEmail = 'user-features@example.com';
const plainPassword = 'password12345';
const testAuthor = 'Autrice Features Test';

let userId: string;
let typeId: number;
let otherTypeId: number;
let themeId: number;
let validatedBookId: number;
let refusedBookId: number;

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
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
}

beforeAll(async () => {
    await app.ready();
    await cleanup();

    const hashed = await argon2.hash(plainPassword);
    const admin = await prisma.user.create({
        data: { email: adminEmail, username: 'adminfeatures', password: hashed, role: 'admin' },
    });
    const user = await prisma.user.create({
        data: { email: userEmail, username: 'userfeatures', password: hashed, role: 'user' },
    });
    userId = user.id;

    const type = await prisma.type.upsert({
        where: { type_name: 'FeatureType' },
        update: {},
        create: { type_name: 'FeatureType' },
    });
    typeId = type.id;

    const otherType = await prisma.type.upsert({
        where: { type_name: 'FeatureTypeBis' },
        update: {},
        create: { type_name: 'FeatureTypeBis' },
    });
    otherTypeId = otherType.id;

    const theme = await prisma.theme.upsert({
        where: { theme_name: 'FeatureTheme' },
        update: {},
        create: { theme_name: 'FeatureTheme' },
    });
    themeId = theme.id;

    const validated = await prisma.book.create({
        data: {
            title: 'Roman Validé Recherchable',
            author: testAuthor,
            publishing_house: 'Maison Features',
            short_description: 'description',
            status: 'validated',
            type_id: typeId,
            user_id: userId,
            themes: { create: [{ theme_id: themeId }] },
        },
    });
    validatedBookId = validated.id;

    await prisma.book.create({
        data: {
            title: 'Autre Genre Validé',
            author: testAuthor,
            publishing_house: 'Maison Features',
            short_description: 'description',
            status: 'validated',
            type_id: otherTypeId,
            user_id: userId,
        },
    });

    const refused = await prisma.book.create({
        data: {
            title: 'Livre Refusé Discret',
            author: testAuthor,
            publishing_house: 'Maison Features',
            short_description: 'description',
            status: 'refused',
            type_id: typeId,
            user_id: userId,
        },
    });
    refusedBookId = refused.id;

    await prisma.book_validation.create({
        data: {
            book_id: refused.id,
            admin_id: admin.id,
            status: 'refused',
            comment: 'Hors ligne éditoriale',
        },
    });
});

afterAll(async () => {
    await cleanup();
});

describe('GET /api/books with filters', () => {
    it('filters validated books by search on title', async () => {
        const response = await app.inject({
            method: 'GET',
            url: 'api/books?search=Recherchable',
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        expect(body.items).toHaveLength(1);
        expect(body.total).toBe(1);
        expect(body.items[0].id).toBe(validatedBookId);
    });

    it('matches on author too and excludes non-validated books', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `api/books?search=${encodeURIComponent('features test')}`,
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        expect(body.items.map((b: { id: number }) => b.id)).not.toContain(refusedBookId);
        expect(body.items).toHaveLength(2);
        expect(body.total).toBe(2);
    });

    it('paginates results with page and limit', async () => {
        const firstPage = await app.inject({
            method: 'GET',
            url: `api/books?search=${encodeURIComponent('features test')}&limit=1&page=1`,
        });
        const secondPage = await app.inject({
            method: 'GET',
            url: `api/books?search=${encodeURIComponent('features test')}&limit=1&page=2`,
        });
        const first = firstPage.json();
        const second = secondPage.json();
        expect(first.items).toHaveLength(1);
        expect(second.items).toHaveLength(1);
        expect(first.page_count).toBe(2);
        expect(second.page).toBe(2);
        expect(first.items[0].id).not.toBe(second.items[0].id);
    });

    it('rejects a limit above 50 with 400', async () => {
        const response = await app.inject({
            method: 'GET',
            url: 'api/books?limit=200',
        });
        expect(response.statusCode).toBe(400);
    });

    it('filters by type_id', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `api/books?type_id=${otherTypeId}&search=${encodeURIComponent(testAuthor)}`,
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        expect(body.items).toHaveLength(1);
        expect(body.items[0].title).toBe('Autre Genre Validé');
    });

    it('filters by theme_id', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `api/books?theme_id=${themeId}&search=${encodeURIComponent(testAuthor)}`,
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        expect(body.items).toHaveLength(1);
        expect(body.items[0].id).toBe(validatedBookId);
    });

    it('rejects an invalid type_id with 400', async () => {
        const response = await app.inject({
            method: 'GET',
            url: 'api/books?type_id=abc',
        });
        expect(response.statusCode).toBe(400);
    });
});

describe('GET /api/books/mine', () => {
    it('returns 401 without cookie', async () => {
        const response = await app.inject({
            method: 'GET',
            url: 'api/books/mine',
            headers: { cookie: 'access_token=' },
        });
        expect(response.statusCode).toBe(401);
    });

    it('returns the connected user books with status and validation comment', async () => {
        const cookie = await loginAndGetCookie(userEmail);
        const response = await app.inject({
            method: 'GET',
            url: 'api/books/mine',
            headers: { cookie },
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        expect(body).toHaveLength(3);

        const refused = body.find((b: { id: number }) => b.id === refusedBookId);
        expect(refused.status).toBe('refused');
        expect(refused.validation_comment).toBe('Hors ligne éditoriale');

        const validated = body.find((b: { id: number }) => b.id === validatedBookId);
        expect(validated.status).toBe('validated');
        expect(validated.validation_comment).toBeNull();
    });

    it('does not return books of other users', async () => {
        const cookie = await loginAndGetCookie(adminEmail);
        const response = await app.inject({
            method: 'GET',
            url: 'api/books/mine',
            headers: { cookie },
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);
        expect(body).toHaveLength(0);
    });
});

describe('GET /api/books/validations', () => {
    it('returns 401 without cookie', async () => {
        const response = await app.inject({
            method: 'GET',
            url: 'api/books/validations',
            headers: { cookie: 'access_token=' },
        });
        expect(response.statusCode).toBe(401);
    });

    it('returns 403 for a non-admin user', async () => {
        const cookie = await loginAndGetCookie(userEmail);
        const response = await app.inject({
            method: 'GET',
            url: 'api/books/validations',
            headers: { cookie },
        });
        expect(response.statusCode).toBe(403);
    });

    it('returns the validation history for an admin', async () => {
        const cookie = await loginAndGetCookie(adminEmail);
        const response = await app.inject({
            method: 'GET',
            url: 'api/books/validations',
            headers: { cookie },
        });
        const body = response.json();
        expect(response.statusCode).toBe(200);

        const entry = body.find((v: { book: { id: number } }) => v.book.id === refusedBookId);
        expect(entry.status).toBe('refused');
        expect(entry.comment).toBe('Hors ligne éditoriale');
        expect(entry.admin.username).toBe('adminfeatures');
        expect(entry.book.title).toBe('Livre Refusé Discret');
    });
});
