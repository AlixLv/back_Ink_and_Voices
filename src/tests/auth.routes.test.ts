import app from '../index';
import { test, expect, it, describe, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// const isDev = process.env.NODE_ENV !== 'production';
const dbUrl = process.env.TEST_DATABASE;
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });


//healthcheck
describe('check the server is working', () => { 
    it('returns 200 OK status', async() => {
        await app.ready();
        const response = await app.inject({
            method: 'GET', 
            url: '/api/auth/' //mais ça devrait pas être la page d'acceuil? juste "/" ?
        });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: '/ route hit success' });
    });
});


// integration test for signup route
describe('Test /api/auth/signup', () => { 
    afterEach(async() => {
        await prisma.user.deleteMany({
            where: { email: 'signupuser@example.com' }
        })
    })
    it('returns successful user creation', async() => {
        await app.ready()
        const newUserData = {
        'email': 'signupuser@example.com', 
        'username': 'signupuser', 
        'password': 'password123'
    }
        const response = await app.inject({
            method: 'POST', 
            url: '/api/auth/signup',  
            payload: newUserData
        })
        expect(response.statusCode).toBe(201);
        expect(response.json()).toEqual( {"email": "signupuser@example.com", "username": "signupuser"});
    })
});


// integration test for login route
describe('Test /api/auth/login', () => { 
    afterEach(async() => {
        await prisma.user.deleteMany({
            where: { email: 'loginuser@example.com' }
        })
    })
    it('returns message on successful user login', async() => {
        await app.ready()
        const newUserData = {
        'email': 'loginuser@example.com', 
        'username': 'loginuser', 
        'password': 'password123'
    }
        await app.inject({
            method: 'POST', 
            url: '/api/auth/signup', 
            payload: newUserData
        })
        const loginResponse = await app.inject({
            method: 'POST', 
            url: '/api/auth/login', 
            payload: {
                email: 'loginuser@example.com',
                password: 'password123'
            }
        })
        const body = loginResponse.json()
        expect(loginResponse.statusCode).toBe(200);
        expect(body.email).toBe('loginuser@example.com');
        expect(body.username).toBe('loginuser');
        expect(body.token).toBeDefined();
    })
});

