import type { FastifyInstance } from "fastify";
import { z } from 'zod';
import {type ZodTypeProvider } from 'fastify-type-provider-zod';

import {updateUser, getUserLogged} from './user.controller.js';

import { updateUserSchema, userProfileResponseSchema } from "./user.schema.js";


export async function userRoutes(app: FastifyInstance){
    const server = app.withTypeProvider<ZodTypeProvider>()

    server.get('/profile', {
        schema: {
            response:{
                200: userProfileResponseSchema,
            }
        }

    }, getUserLogged)

    server.post('/update-profile', {
        schema: {
            body: updateUserSchema,
            response: { 
                201: userProfileResponseSchema,
            }
        }

    }, updateUser)
}