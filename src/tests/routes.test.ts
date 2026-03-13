import app from '../index';
import { test, expect, it, vi, describe } from 'vitest';
import { faireUnTest } from '../modules/user/user.route'
import { request } from 'https';

// test unitaire qui vérifie juste l'execution et le retour d'une fonction
test( 'should return given string', () => {
    console.log('soleil');
    expect(faireUnTest('soleil!!!')).toBe('soleil!!!')
});

// test d'intégration qui vérifie que la route '/' marche
test('GET / should return status OK', async() => {
    await app.ready();
    const response = await app.inject({
        method: 'GET', 
        url: '/api/users/'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: '/ route hit success' });
});


test('POST /register', async() => {
    await app.ready();
    const newUserData = {
        'email': 'newuser@example.com', 
        'username': 'newuser', 
        'password': 'password123'}
    const newUserDataJson =  'email: newuser@example.com,  username: newuser, password: password123';
    const response = await app.inject({
        method: 'POST',
        url: `/api/users/register/${newUserDataJson}`
    })
    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({ message: "email: newuser@example.com, username: newuser"});
});


describe('Test auth routes', () => {
    describe('Test /api/users/register', () => {
        it('returns message on successful user creation', async() => {
            const newUserData = {
            'email': 'newuser@example.com', 
            'username': 'newuser', 
            'password': 'password123'}
            }
            const res = await request.post('/api/users/register').send(newUserData);
            expect(res.body.success).toBeTruthy();
        );
        it('returns fail if user already exists', async() => {
            const newUserData = {
            'email': 'newuser@example.com', 
            'username': 'newuser', 
            'password': 'password123'}
            }
            const res = await request.post('/api/users/register').send(newUserData);
            expect(res.body.success).toBeTruthy();
        );
        describe('Test /api/users/login', () => {
            it('returns message on successful login', async() => {
                const loginData = {
                'email': '
    });
})