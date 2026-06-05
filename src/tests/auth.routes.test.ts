import app from '../index';
import { test, expect, it, describe, beforeEach } from 'vitest';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const isDev = process.env.NODE_ENV !== 'production';
const dbUrl = isDev ? process.env.LOCAL_DATABASE_URL : process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });


// healthcheck
test('GET / should return status OK', async() => {
    await app.ready();
    const response = await app.inject({
        method: 'GET', 
        url: '/api/auth/' 
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: '/ route hit success' });
});



// test d'intégration route signup
describe('Test /api/auth/signup', () => { 
    let uniqueSignupEmail: string;
    beforeEach(async() => {
        uniqueSignupEmail = `signupuser.${Math.random().toString(36).substring(7)}@example.com`;
        await prisma.user.deleteMany({
             where: { email: uniqueSignupEmail }
      })
    })
    it('returns successful user creation', async() => {
        await app.ready()
        const newUserData = {
        'email': uniqueSignupEmail, 
        'username': 'signupuser', 
        'password': 'password123'
    }
        const response = await app.inject({
            method: 'POST', 
            url: '/api/auth/signup',  
            payload: newUserData
        })
        expect(response.statusCode).toBe(201);
        expect(response.json()).toEqual( {"email": uniqueSignupEmail, "username": "signupuser"});
    })
});


// test d'intégration route login
describe('Test /api/auth/login', () => { 
    let uniqueLoginEmail: string;
    beforeEach(async() => {
        uniqueLoginEmail = `loginuser.${Math.random().toString(36).substring(7)}@example.com`;
        await prisma.user.deleteMany({
             where: { email: uniqueLoginEmail }
      })
    })
    it('returns message on successful user login', async() => {
        await app.ready()
        const newUserData = {
        'email': uniqueLoginEmail, 
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
                email: uniqueLoginEmail,
                password: 'password123'
            }
        })
        const body = loginResponse.json()
        expect(loginResponse.statusCode).toBe(200);
        expect(body.email).toBe(uniqueLoginEmail);
        expect(body.username).toBe('loginuser');
        expect(body.token).toBeDefined();
    })
});

