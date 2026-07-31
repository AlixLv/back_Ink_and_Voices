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
      tags: ['auth'],
      response:{
        200: z.object({message: z.string()}).describe('Default response')
      } 
    }
  } , async (req, reply) => {
    reply.send({ message: '/ route hit success' })
  })

  server.post('/signup', {
    schema: {
      description: 'signup endpoint',
      tags: ['auth'],
      body: createUserSchema,
      response: {
        201: createUserResponseSchema.describe('Successful account creation response'),
      }
    }
  }, signUp)


  server.post('/login', {
    schema: {
      description: 'login endpoint',
      tags: ['auth'],
      body: loginUserSchema,
      response: {
        200: loginUserResponseSchema.describe('Successful login response'),
      }
    }
  }, loginUserHandler);


  server.delete('/logout', {
    schema: {
      description: 'logout endpoint',
      tags: ['auth'],
      response: {
        200: logoutResponseSchema.describe('Successful logout response'),
      }
    }
  }, logoutHandler)

  server.log.info('auth routes registered')
}