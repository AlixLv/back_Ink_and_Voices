import type { FastifyInstance } from 'fastify'
import { z } from 'zod';
import {type ZodTypeProvider } from 'fastify-type-provider-zod';
import { createUserSchema, createUserResponseSchema } from './user.schema.js';
import { registerUserHandler } from './user.controller.js';


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
  }, registerUserHandler)

  server.post('/login', () => {})

  server.delete('/logout', () => {})

  server.log.info('user routes registered')
}