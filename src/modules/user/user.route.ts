import type { FastifyInstance } from 'fastify'
import { z } from 'zod';
import {type ZodTypeProvider } from 'fastify-type-provider-zod';

import { signUp } from './user.controller.js';

import { createUserSchema, createUserResponseSchema, loginUserSchema, loginUserResponseSchema } from './user.schema.js';
import { loginUserHandler } from './user.controller.js';



export async function userRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>()

  server.get('/', {
    schema: {
      response:{
        200: z.object({message: z.string()})
      } 
    }
  } , async (req, reply) => {
    reply.send({ message: '/ route hitttt success' })
  })

  server.post('/signup', {
    schema: {
      body: createUserSchema,
      response: {
        201: createUserResponseSchema,
      }
    }
  }, signUp)


  server.post('/login', {
    schema: {
      body: loginUserSchema,
      reponse: {
        200: loginUserResponseSchema,
      }
    }
  }, loginUserHandler);


  server.delete('/logout', () => {})

  server.log.info('user routes registered')
}