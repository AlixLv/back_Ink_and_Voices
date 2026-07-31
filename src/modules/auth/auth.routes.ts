import type { FastifyInstance } from 'fastify'
import { z } from 'zod';
import {type ZodTypeProvider } from 'fastify-type-provider-zod';

import { signUp } from './auth.controller.js';

import { createUserSchema, createUserResponseSchema, loginUserSchema, loginUserResponseSchema, logoutResponseSchema } from './auth.schema.js';
import { loginUserHandler, logoutHandler } from './auth.controller.js';


export function faireUnTest(a : String) {
    return a;
}

export async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>()

  server.get('/', {
    schema: {
      description: 'homepage endpoint',
      tags: ['auth', 'code'],
      response:{
        200: z.object({message: z.string()})
      } 
    }
  } , async (req, reply) => {
    reply.send({ message: '/ route hit success' })
  })

  server.post('/signup', {
    schema: {
      description: 'signup endpoint',
      tags: ['auth', 'signup'],
      body: createUserSchema,
      response: {
        201: createUserResponseSchema,
      }
    }
  }, signUp)


  server.post('/login', {
    schema: {
      body: loginUserSchema,
      response: {
        200: loginUserResponseSchema,
      }
    }
  }, loginUserHandler);


  server.delete('/logout', {
    schema: {
      response: {
        200: logoutResponseSchema,
      }
    }
  }, logoutHandler)

  server.log.info('auth routes registered')
}