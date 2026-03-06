import type { FastifyInstance } from 'fastify'
import { z } from 'zod';
import {type ZodTypeProvider } from 'fastify-type-provider-zod';
import { createUserSchema, createUserResponseSchema } from './user.schema.js';
<<<<<<< HEAD
import { signUp } from './user.controller.js';
=======
import { registerUserHandler } from './user.controller.js';
>>>>>>> b2190da (feat: connexion finale à prismaClient en se basant sur le code d'alix pour register)


export async function userRoutes(app: FastifyInstance) {
  // Utilisation de withTypeProvider pour avoir les types automatiques
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

  server.post('/login', () => {})

  server.delete('/logout', () => {})

  server.log.info('user routes registered')
}