import app from '../../../index';
import { describe, beforeEach, beforeAll, expect, it, afterAll, afterEach } from "vitest";
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { string } from 'zod';
import { profile } from 'console';

const dbUrl = process.env.TEST_DATABASE;
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
    await app.ready()
})

// test d'intégration route protégée profile
describe('Test /api/users/profile', () => {
    afterEach(async() => {
//    beforeEach(async() => {
        await prisma.user.deleteMany({
            where: { email: 'testuser@example.com'}
        })
    })
    it('returns successful user creation', async() => {
        const newUserData = {
            email: 'testuser@example.com',
            username: 'testuser', 
            password:'testpassword123'
        }
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/signup',
            payload: newUserData
        })
        
        const loginResponse = await app.inject({
            method: 'POST', 
            url: 'api/auth/login',
            payload: {
                email:'testuser@example.com',
                password:'testpassword123'
            }
        })
        const bodyLogin = loginResponse.json();
        const cookieHeader = loginResponse.headers['set-cookie']
        const rawCookie = (Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader) ?? ""
        const token = rawCookie.split(';')[0]?.split('=').slice(1).join('=')
        
        const profileResponse = await app.inject({
            method: 'GET',
            url: 'api/users/profile',
            headers: {cookie: 'access_token=' + token}
        })
        const bodyProfile = profileResponse.json();
        expect(profileResponse.statusCode).toBe(200);
        expect(bodyProfile.email).toBe('testuser@example.com');
        expect(bodyProfile.username).toBe('testuser');
    })
})

// test accès route profile sans cookie
describe('Test /api/users/profile swhit untautorized access', () => {
    it('should return error 401 without cookie', async() => {
        const profileResponse = await app.inject({
            method: 'GET',
            url: 'api/users/profile',
            headers: {cookie: 'access_token='}
        })
        const bodyProfile = profileResponse.json();
        expect(profileResponse.statusCode).toBe(401);
        expect(bodyProfile.message).toBe("Token invalide ou absent");
        
    })

    it('should return error 401 with corrupted token', async() => {
        const profileResponse = await app.inject({
            method: 'GET',
            url: 'api/users/profile',
            headers: {cookie: 'access_token=' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30'}
        })
        const bodyProfile = profileResponse.json();
        expect(profileResponse.statusCode).toBe(401);
        expect(bodyProfile.message).toBe("Token invalide ou absent");
    })
})



afterAll(async() => {
    await prisma.user.deleteMany({
        where: { email: 'testuser@example.com'}
    })
})