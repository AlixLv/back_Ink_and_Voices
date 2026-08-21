import app from '../../../index';
import { describe, beforeAll, afterAll, expect, it } from 'vitest';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const dbUrl = process.env.TEST_DATABASE;
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

const email = 'avatar-user@example.com';
const plainPassword = 'password12345';

async function cleanup() {
    await prisma.user.deleteMany({ where: { email } });
}

beforeAll(async () => {
    await app.ready();
    await cleanup();
    const hashed = await argon2.hash(plainPassword);
    await prisma.user.create({
        data: { email, username: 'avataruser', password: hashed },
    });
});

afterAll(async () => {
    await cleanup();
});

async function loginAndGetCookie() {
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

describe('avatar on profile', () => {
    it('defaults to null on /me', async () => {
        const cookie = await loginAndGetCookie();
        const response = await app.inject({
            method: 'GET',
            url: 'api/users/me',
            headers: { cookie },
        });
        expect(response.statusCode).toBe(200);
        expect(response.json().avatar).toBeNull();
    });

    it('updates the avatar and returns it on /me', async () => {
        const cookie = await loginAndGetCookie();
        const update = await app.inject({
            method: 'PUT',
            url: 'api/users/update-profile',
            headers: { cookie },
            payload: { avatar: 'inky-03' },
        });
        expect(update.statusCode).toBe(200);

        const me = await app.inject({
            method: 'GET',
            url: 'api/users/me',
            headers: { cookie },
        });
        expect(me.json().avatar).toBe('inky-03');
    });

    it('rejects an unknown avatar id with 400', async () => {
        const cookie = await loginAndGetCookie();
        const response = await app.inject({
            method: 'PUT',
            url: 'api/users/update-profile',
            headers: { cookie },
            payload: { avatar: 'https://evil.example/x.png' },
        });
        expect(response.statusCode).toBe(400);
    });
});
