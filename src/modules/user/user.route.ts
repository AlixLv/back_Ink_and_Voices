import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod';
import {type ZodTypeProvider } from 'fastify-type-provider-zod';
import { serializerCompiler, validatorCompiler}  from 'fastify-type-provider-zod';
import { $ref } from './user.schema';


export async function userRoutes(app: FastifyInstance) {
  // Utilisation de withTypeProvider pour avoir les types automatiques
  app.withTypeProvider<ZodTypeProvider>().get('/', {
    schema: {
      response:{
        200: z.object({message: z.string()})
      } 
    }
  } , async (req, reply) => {
    reply.send({ message: '/ route hit success' })
  })

  app.withTypeProvider<ZodTypeProvider>().post('/register', {
    schema: {
      body: $ref('createUserSchema'),
      response: {
        201: $ref('createUserResponseSchema'),
      }
    }
  }, async(req, reply) => {
    const {email, password, username} = req.body
    app.log.info(`Nouvel utilisateur créé: ${email}, ${username}`)
    return { success: true }
  })

  app.withTypeProvider<ZodTypeProvider>().post('/login', () => {})

  app.withTypeProvider<ZodTypeProvider>().delete('/logout', () => {})

  app.withTypeProvider<ZodTypeProvider>().log.info('user routes registered')
}