import app from '../../../index';
import { expect, it, describe, afterEach } from 'vitest';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';


const dbUrl = process.env.TEST_DATABASE;
console.log("🌸 dbURL utilisée: ", dbUrl)
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

        // Le token ne doit PAS être dans le body : s'il y était, le front
        // pourrait le copier en localStorage et l'exposer à toute XSS.
        expect(body.token).toBeUndefined();

        // Il voyage uniquement dans le cookie httpOnly, illisible depuis JS.
        const authCookie = loginResponse.cookies.find((c) => c.name === 'access_token');
        expect(authCookie).toBeDefined();
        expect(authCookie?.httpOnly).toBe(true);
    })
});


// integration test for logout route
describe('Test /api/auth/logout', () => {
    it('should clear the access_token cookie', async() => {
        await app.ready();
        const response = await app.inject({
            method: 'DELETE',
            url: '/api/auth/logout'
        });

        expect(response.statusCode).toBe(200);

        // clearCookie renvoie un access_token vide et déjà expiré : c'est comme
        // ça que le serveur demande au navigateur d'oublier le cookie httpOnly.
        // Le front ne peut pas le faire lui-même, d'où cette route.
        const cleared = response.cookies.find((c) => c.name === 'access_token');
        expect(cleared).toBeDefined();
        expect(cleared?.value).toBe('');
    });
});
