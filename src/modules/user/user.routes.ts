import type { FastifyInstance } from "fastify";
import {type ZodTypeProvider } from 'fastify-type-provider-zod';

import {updateUser, getUserLogged} from './user.controller.js';

import { updateUserSchema, userProfileResponseSchema, updateUserResponseSchema } from "./user.schema.js";


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
}
