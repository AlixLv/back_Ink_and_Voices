import Fastify, { fastify, type FastifyReply, type FastifyRequest } from 'fastify';
import cors from "@fastify/cors";
import { PrismaClient, Prisma } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/user/user.routes.js';
import { bookRoutes } from './modules/book/book.route.js';
import { typeRoutes } from './modules/type/type.routes.js';
import { themeRoutes } from './modules/theme/theme.routes.js';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifyJwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';
import { ApiError } from './errors/ApiError.js';
import { ZodError } from 'zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';


// 1. Configuration de la Base de Données (Le tuyau DB)
const dbUrlMap: Record<string, string | undefined> = {
  test: process.env.TEST_DATABASE,
  development: process.env.LOCAL_DATABASE_URL,
  production: process.env.DATABASE_URL,
};

const dbUrl = dbUrlMap[process.env.NODE_ENV || 'development'];

if (!dbUrl) throw new Error(`DATABASE_URL not configured for ${process.env.NODE_ENV}`);

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

// 2. Configuration du Serveur (Le tuyau Web)
const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
const { ADDRESS = '0.0.0.0', PORT = '8032' } = process.env;

// 3. Liaison
app.decorate('prisma', prisma);


// sorte de portier qui va vérifier que les données envoyées dans la req correspondent bien au schéma Zod déclaré
// si les données sont valides, il laisse passer la req et remplit res.body avec les données typées
// si les donnée sont invalides, il bloque la req et renvoie une erreur 400 Bad Request au client
app.setValidatorCompiler(validatorCompiler)
// contrôleur qualité de nos responses
// on définit un schéma Zod pour renvoyer des data dans les responses 200, le SerializerCompiler prend l'objet qu'on retourne
// il le transforme en chaîne JSON en suivant le schema Zod. 
// Si notre objet contient des data pas présentent dans le schéma, il ne les envoie pas au client
app.setSerializerCompiler(serializerCompiler)

// identification du frontend pour accepter ses requêtes côté backend
await app.register(cors, {
    origin: 'http://localhost:5177',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true //pour que backend accepte bien le cookie contenant l'access_token du front
  });

// JWT
await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  cookie: {
    cookieName: 'access_token',
    signed:false
  }
});

// plugin Cookie 
await app.register(fCookie, {
  secret: process.env.COOKIE_SECRET_KEY ?? 'your-secret-key',
  hook: 'preHandler',
})

// Déclaration de authenticate, qui sera utilisé sur les routes protégées
app.decorate('authenticate', async function(
  req: FastifyRequest,
  reply: FastifyReply) {
    try {
        await req.jwtVerify({ onlyCookie: true })
        console.log('✅ Token vérifié avec succès')
    } catch (err){
        console.log('❌ Erreur JWT:', err);
        reply.code(401).send({message: "Token invalide ou absent"})
  }
})

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);

  if(error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      // sérialisation de l'objet JS en texte JSON
      error: error.code ?? error.name,
      message: error.message,
    });
  }

  if(error instanceof ZodError){
    return reply.status(400).send({
      error: 'DATA_VALIDATION_ERROR',
      message: error.issues.map((i) => i.message).join(','),
    });
  }

  if(error instanceof Prisma.PrismaClientKnownRequestError){
    return reply.status(500).send({
      error: 'DATABASE_ERROR',
      message: 'A database error occurred',
    });
  }

  // fallback pour ne pas exposer les erreurs côté serveur
  return reply.status(500).send({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  })
})

// swagger pour la documentation
if (process.env.NODE_ENV !== 'production'){
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Ink&Voices API',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:8032',
          description: 'development server'
        }
      ],
      tags: [
        { name: 'auth', description: 'Authentication related endpoints'},
        { name: 'user', description: 'Users related endpoints'},
        { name: 'book', description: 'Books related endpoints'},
        { name: 'type', description: 'Book types (genres) related endpoints'},
        { name: 'theme', description: 'Book themes related endpoints'}
      ]
    },
    // Le swagger s'attend à recevoir du JSON schema brut.
    // on utilise les schémas Zod, il faut donc les transformer en JSON
    transform: jsonSchemaTransform
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/documentation'
  });
}

// routes
app.register(authRoutes, {prefix: 'api/auth'})
app.register(userRoutes, {prefix: 'api/users'})

app.register(bookRoutes, { prefix: '/api/books' });
app.register(typeRoutes, { prefix: '/api/types' });
app.register(themeRoutes, { prefix: '/api/themes' });

// graceful shutdown
const listeners = ['SIGINT', 'SIGTERM']
listeners.forEach((signal) => {
  process.on(signal, async () => {
    await app.close()
    process.exit(0)
  })
})

// ---- MAIN ----
const start = async () => {
    try {
      await app.listen({ host: ADDRESS, port: parseInt(PORT, 10)})
    } catch (err){
      app.log.error(err); 
      process.exit(1);
    }
  };

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export default app;