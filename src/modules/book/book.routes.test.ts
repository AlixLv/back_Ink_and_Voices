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

// test accès à la route protégée POST /api/books sans cookie
describe('Test POST /api/books unauthorized access', () => {
    it('should return error 401 without cookie', async () => {
        const response = await app.inject({
            method: 'POST',
            url: 'api/books',
            headers: { cookie: 'access_token=' },
            payload: {
                title: 'Livre Test',
                author: 'Autrice Test',
                publishing_house: 'Maison Test',
                short_description: 'desc',
                type_id: 1,
            },
        })
        const body = response.json();
        expect(response.statusCode).toBe(401);
        expect(body.message).toBe('Token invalide ou absent');
    })
})

// test accès à la route protégée GET /api/books/mine sans cookie
describe('Test GET /api/books/mine unauthorized access', () => {
    it('should return error 401 without cookie', async () => {
        const response = await app.inject({
            method: 'GET',
            url: 'api/books/mine',
            headers: { cookie: 'access_token=' },
        })
        const body = response.json();
        expect(response.statusCode).toBe(401);
        expect(body.message).toBe('Token invalide ou absent');
    })
})

// test accès autorisé : ne renvoie que les livres de la personne connectée
describe('Test GET /api/books/mine allowed when logged in', () => {
    afterEach(async () => {
        await prisma.user.deleteMany({ where: { email: 'mybookstest@example.com' } })
    })

    it('should return 200 with only the logged-in user\'s own books', async () => {
        await app.inject({
            method: 'POST',
            url: '/api/auth/signup',
            payload: {
                email: 'mybookstest@example.com',
                username: 'mybookstestuser',
                password: 'testpassword123',
            },
        })

        const loginResponse = await app.inject({
            method: 'POST',
            url: 'api/auth/login',
            payload: { email: 'mybookstest@example.com', password: 'testpassword123' },
        })
        const cookieHeader = loginResponse.headers['set-cookie']
        const rawCookie = (Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader) ?? ""
        const token = rawCookie.split(';')[0]?.split('=').slice(1).join('=')

        const response = await app.inject({
            method: 'GET',
            url: 'api/books/mine',
            headers: { cookie: 'access_token=' + token },
        })
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual([]);
    })
})
