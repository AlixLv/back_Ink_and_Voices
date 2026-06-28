import type { FastifyInstance } from "fastify";
import { z } from 'zod';
import {type ZodTypeProvider } from 'fastify-type-provider-zod';

import {updateUser, getUserLogged} from './user.controller.js';

import { updateUserSchema, userProfileResponseSchema } from "./user.schema.js";


export async function userRoutes(app: FastifyInstance){
    const server = app.withTypeProvider<ZodTypeProvider>()

    server.get('/profile', {
        preHandler: [app.authenticate],
        schema: {
            response:{
                200: userProfileResponseSchema,
            }
        }

    }, getUserLogged)

    server.post('/update-profile', {
        preHandler: [app.authenticate],
        schema: {
            body: updateUserSchema,
            response: { 
                200: userProfileResponseSchema,
            }
        }

    }, updateUser)
}