import app from '../../index';
import { describe, beforeAll, expect, it } from 'vitest';

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
