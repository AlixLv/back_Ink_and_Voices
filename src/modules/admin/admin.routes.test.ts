import app from '../../index';
import { describe, beforeAll, expect, it, afterEach } from 'vitest';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const dbUrl = process.env.TEST_DATABASE;
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
    await app.ready()
})

// Se logue et renvoie le cookie access_token, comme dans user.routes.test.ts
async function loginAndGetToken(email: string, password: string) {
    const loginResponse = await app.inject({
        method: 'POST',
        url: 'api/auth/login',
        payload: { email, password },
    })
    const cookieHeader = loginResponse.headers['set-cookie']
    const rawCookie = (Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader) ?? ""
    return rawCookie.split(';')[0]?.split('=').slice(1).join('=')
}

// test accès à la route protégée GET /api/admin/books/pending sans cookie
describe('Test GET /api/admin/books/pending unauthorized access', () => {
    it('should return error 401 without cookie', async () => {
        const response = await app.inject({
            method: 'GET',
            url: 'api/admin/books/pending',
            headers: { cookie: 'access_token=' },
        })
        const body = response.json();
        expect(response.statusCode).toBe(401);
        expect(body.message).toBe('Token invalide ou absent');
    })
})

// test accès refusé pour un utilisateurice connecté·e mais non admin
describe('Test GET /api/admin/books/pending forbidden for non-admin', () => {
    afterEach(async () => {
        await prisma.user.deleteMany({ where: { email: 'admintest@example.com' } })
    })

    it('should return error 403 for a logged-in user who is not admin', async () => {
        await app.inject({
            method: 'POST',
            url: '/api/auth/signup',
            payload: {
                email: 'admintest@example.com',
                username: 'admintestuser',
                password: 'testpassword123',
            },
        })

        const token = await loginAndGetToken('admintest@example.com', 'testpassword123')

        const response = await app.inject({
            method: 'GET',
            url: 'api/admin/books/pending',
            headers: { cookie: 'access_token=' + token },
        })
        const body = response.json();
        expect(response.statusCode).toBe(403);
        expect(body.message).toBe('Accès réservé aux administrateurices.');
    })
})

// test accès autorisé pour un compte admin
describe('Test GET /api/admin/books/pending allowed for admin', () => {
    afterEach(async () => {
        await prisma.user.deleteMany({ where: { email: 'admintest2@example.com' } })
    })

    it('should return 200 for a logged-in admin', async () => {
        await app.inject({
            method: 'POST',
            url: '/api/auth/signup',
            payload: {
                email: 'admintest2@example.com',
                username: 'admintestuser2',
                password: 'testpassword123',
            },
        })

        await prisma.user.update({
            where: { email: 'admintest2@example.com' },
            data: { role: 'admin' },
        })

        const token = await loginAndGetToken('admintest2@example.com', 'testpassword123')

        const response = await app.inject({
            method: 'GET',
            url: 'api/admin/books/pending',
            headers: { cookie: 'access_token=' + token },
        })
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.json())).toBe(true);
    })
})
