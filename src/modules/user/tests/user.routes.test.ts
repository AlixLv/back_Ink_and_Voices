import app from '../../../index';
import { describe, beforeEach, beforeAll, expect, it, afterAll, afterEach } from "vitest";
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';
import { string } from 'zod';
import { profile } from 'console';

const dbUrl = process.env.TEST_DATABASE;
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
    await app.ready()

    await prisma.user.deleteMany({
        where: {
            email: {
                in: [
                    'testuser@example.com',
                    'testprofile@example.com',
                    'testnewprofile@example.com'
                ]
            }
        }
    })
})

// test d'intégration route protégée profile
describe('Test /api/users/profile', () => {
    beforeEach(async() => {
        // nettoyage de la base de données avant le test
        await prisma.user.deleteMany({
            where: { email: 'testuser@example.com', }
        })
    });
        
    afterEach(async() => {
        await prisma.user.deleteMany({
            where: { email: 'testuser@example.com'}
        })
    });

    it('returns successful user creation', async() => {
        const plainPassword = 'testpassword123';
        const newUserData = {
            email: 'testuser@example.com',
            username: 'testuser', 
            password: plainPassword
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
                password: plainPassword
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
describe('Test /api/users/profile with untautorized access', () => {
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


// tests d'intégration
// test data retournées après update du profil sans modification pwd
describe('Test /api/users/update-profile without password changed', () => {
    beforeEach(async() => {
        // nettoyage de la base de données avant le test
        await prisma.user.deleteMany({
            where: { email: { in : ['testprofile@example.com', 'testnewprofile@example.com']}}
        })
        
        // creation du user de test
        const plainPassword = 'testpwd123dd';
        const hashedPwd = await argon2.hash(plainPassword);
        await prisma.user.create({
            data: {
                email: 'testprofile@example.com',
                username: 'testprofile', 
                password: hashedPwd
            }
        })
    });

    // nettoyage de la base après le test
    afterEach(async() => {
        await prisma.user.deleteMany({
            where: { email: { in : ['testprofile@example.com', 'testnewprofile@example.com']}}
        })
    })

    it('should return successful user updated profile without password changed', async() => {  
        const plainPassword = 'testpwd123dd';

        const loginResponse = await app.inject({
            method: 'POST', 
            url: 'api/auth/login',
            payload: {
                email:'testprofile@example.com',
                password: plainPassword
            }
        })

        const cookieHeader = loginResponse.headers['set-cookie']
        const rawCookie = (Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader) ?? ""
        const token = rawCookie.split(';')[0]?.split('=').slice(1).join('=')
        
        const profileResponse = await app.inject({
            method: 'GET',
            url: 'api/users/profile',
            headers: {cookie: 'access_token=' + token}
        })

        const updatedUserData =  {
            email: 'testnewprofile@example.com',
            username: 'testnewprofile', 
        }

        const res = await app.inject({
            method: 'POST',
            url: 'api/users/update-profile',
            headers: {cookie: 'access_token=' + token},
            payload: updatedUserData
        })

        const dbUser = await prisma.user.findUnique({
            where: {email: 'testnewprofile@example.com'}
        });

        const bodyUpdatedProfile = res.json();
        expect(res.statusCode).toBe(200);
        expect(bodyUpdatedProfile.email).toBe('testnewprofile@example.com');
        expect(bodyUpdatedProfile.username).toBe('testnewprofile');
        expect(bodyUpdatedProfile.requiresLogin).toBe(false);

        // cookie n'est pas renvoyé par le backend si pas de modification de password. 
        // Objectif métier: vérifier que user reste connectée, il faut vérifier le statusCode
        const profileAfterUpdate = await app.inject({
            method: 'GET',
            url: 'api/users/profile',
            headers: {cookie: 'access_token=' + token}
        })

        expect(profileAfterUpdate.statusCode).toBe(200);
    })
})

// test de vérification du clear Cookie après update du profil avec password modifié
describe('Test /api/users/update-profile with password changed', () => {
    beforeEach(async() => {
        await prisma.user.deleteMany({
            where: { email: {
                in: [
                    'testpwd@example.com'
                ]
            }}
        })

        const plainPwd = 'testpwd567pp';
        const hashedPassword = await argon2.hash(plainPwd);
        await prisma.user.create({
            data: {
                email: 'testpwd@example.com',
                username: 'testpwd',
                password: hashedPassword
            }
        })
    });

    afterEach(async() => {
        await prisma.user.deleteMany({
            where: { email: { 
                in: [
                    'testpwd@example.com'
                ]
            }}
        })
    })

    it('should return cleared cookie and new requiresLogin to True value', async() => {
        const plainPwd = 'testpwd567pp';

        const loggedResponse = await app.inject({
            method: 'POST',
            url: 'api/auth/login',
            payload: {
                email: 'testpwd@example.com',
                password: plainPwd
            }
        })

        const cookieHd = loggedResponse.headers['set-cookie']
        const rCookie = (Array.isArray(cookieHd) ? cookieHd[0] : cookieHd) ?? ""
        const newToken = rCookie.split(';')[0]?.split('=').slice(1).join('=')


        const profileRes = await app.inject({
            method: 'GET',
            url: 'api/users/profile',
            headers: {cookie: 'access_token=' + newToken}
        })

        const updateUserData =  {
            password: 'testupdatedpwd456'
        }

        const responseUpdatedPwd = await app.inject({
            method: 'POST',
            url: 'api/users/update-profile',
            headers: {cookie: 'access_token=' + newToken},
            payload: updateUserData
        })

        const dbUpdatedUser = await prisma.user.findUnique({
            where: {email: 'testpwd@example.com'}
        });
        
        const bodyNewPassword = responseUpdatedPwd.json();
        expect(responseUpdatedPwd.statusCode).toBe(200);
        expect(bodyNewPassword.email).toBe('testpwd@example.com');
        expect(bodyNewPassword.username).toBe('testpwd');
        expect(bodyNewPassword.requiresLogin).toBe(true);

        const newHeaders = responseUpdatedPwd.headers['set-cookie'] as string;
        expect(newHeaders).toContain('access_token=');
        expect(newHeaders).toContain('Max-Age=0');
    })

        
})


// test tentative d'accès à /update-profile sans token
describe('Test /api/users/update-profile without access token', () => {
    it('should return access error 401', async() => {
        const updateUserInfo = await app.inject({
            method: 'POST',
            url: 'api/users/update-profile',
            payload: {
                username: 'Toto'
            }
        })
        expect(updateUserInfo.statusCode).toBe(401);
        expect(updateUserInfo.statusMessage).toBe('Unauthorized');
    });
});




afterAll(async() => {
    await prisma.user.deleteMany({
        where: {
            email: {
                in: [
                    'testuser@example.com',
                    'testprofile@example.com',
                    'testnewprofile@example.com',
                    'testpwd@example.com'
                ]
            }
        }
    })
    await app.close();
});