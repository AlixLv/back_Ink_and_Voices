import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

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
      body: z.object({
        email: z.email(),
        password: z.string().min(8),
        username: z.string()
      })
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