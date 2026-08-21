import type { FastifyInstance } from "fastify";
import {type ZodTypeProvider } from 'fastify-type-provider-zod';

import {updateUser, getUserLogged, deleteAccount, listUsers, getUserDetail, updateUserRole} from './user.controller.js';

import { updateUserSchema, userProfileResponseSchema, updateUserResponseSchema, userIdParamsSchema, adminUserSchema, listUsersResponseSchema, updateRoleSchema, messageResponseSchema } from "./user.schema.js";


export async function userRoutes(app: FastifyInstance){
    const server = app.withTypeProvider<ZodTypeProvider>()

    // GET /api/users/me : "qui est la personne connectée ?"
    // Route protégée (le preHandler exige un cookie valide) : elle renvoie
    // l'utilisateur identifié par le cookie, ou 401 si personne. C'est ce que
    // le front interroge au démarrage pour savoir s'il est connecté.
    // (Anciennement /profile — renommée en /me pour ne pas la confondre avec la
    // page de profil front `profile/[id]`, qui est un tout autre besoin.)
    server.get('/me', {
        preHandler: [app.authenticate],
        schema: {
            description: 'Connected user checked endpoint',
            tags: ['user'],
            response:{
                200: userProfileResponseSchema.describe('Successful response'),
            }
        }

    }, getUserLogged)

    server.put('/update-profile', {
        preHandler: [app.authenticate],
        schema: {
            description: 'update profile endpoint',
            tags: ['user'],
            body: updateUserSchema,
            response: {
                200: updateUserResponseSchema.describe('Successful updated profile response'),
            }
        }

    }, updateUser)

    server.delete('/me', {
        preHandler: [app.authenticate],
        schema: {
            description: 'delete the connected user account and all associated data (GDPR right to erasure)',
            tags: ['user'],
            response: {
                200: messageResponseSchema.describe('Account deleted'),
            }
        }

    }, deleteAccount)

    server.get('/', {
        preHandler: [app.authenticate, app.isAdmin],
        schema: {
            description: 'list all user accounts (admin only)',
            tags: ['user'],
            response: {
                200: listUsersResponseSchema.describe('Users list'),
            }
        }

    }, listUsers)

    server.get('/:id', {
        preHandler: [app.authenticate, app.isAdmin],
        schema: {
            description: 'get one user account (admin only)',
            tags: ['user'],
            params: userIdParamsSchema,
            response: {
                200: adminUserSchema.describe('User detail'),
            }
        }

    }, getUserDetail)

    server.patch('/:id/role', {
        preHandler: [app.authenticate, app.isAdmin],
        schema: {
            description: 'change a user role (admin only, not your own)',
            tags: ['user'],
            params: userIdParamsSchema,
            body: updateRoleSchema,
            response: {
                200: adminUserSchema.describe('Updated user'),
            }
        }

    }, updateUserRole)
}
