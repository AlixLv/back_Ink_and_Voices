import type { FastifyInstance } from 'fastify'
import { z } from 'zod';
import {type ZodTypeProvider } from 'fastify-type-provider-zod';

import { signUp } from './auth.controller.js';

import { createUserSchema, createUserResponseSchema, loginUserSchema, loginUserResponseSchema } from './user.schema.js';
import { loginUserHandler } from './auth.controller.js';


<<<<<<< HEAD:src/modules/user/auth.routes.ts
export function faireUnTest(a : String) {
    return a;
}

=======
>>>>>>> fe417ec (feature: ajout du module @fastify/cors pour accepter requêtes provenant du front + update index.ts pour ajouter le décorateur cors et le décorateur prisma à app):src/modules/user/user.route.ts
export async function userRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>()

  server.get('/', {
    schema: {
      response:{
        200: z.object({message: z.string()})
      } 
    }
  } , async (req, reply) => {
    reply.send({ message: '/ route hit success' })
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
      response: {
        200: loginUserResponseSchema,
      }
    }
  }, loginUserHandler);


  server.delete('/logout', () => {})

  server.log.info('user routes registered')
}