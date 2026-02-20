import type { FastifyInstance } from 'fastify'
import { z } from 'zod';
import {type ZodTypeProvider } from 'fastify-type-provider-zod';
import { createUserSchema, createUserResponseSchema } from './user.schema.js';


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

  server.post('/register', {
    schema: {
      body: createUserSchema,
      response: {
        201: createUserResponseSchema,
      }
    }
  }, async(req, reply) => {
    const {email, password, username} = req.body
    app.log.info(`Nouvel utilisateur créé: ${email}, ${username}`)
    const newUser = {
      email: email,
      username: username
    }
    reply.code(201)
    return newUser
  })

  server.post('/login', () => {})

  server.delete('/logout', () => {})

  server.log.info('user routes registered')
}