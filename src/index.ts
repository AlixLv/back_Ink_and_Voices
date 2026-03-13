import Fastify from 'fastify';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { userRoutes } from './modules/user/user.route.js';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';


// 1. Configuration de la Base de Données (Le tuyau DB)
const isDev = process.env.NODE_ENV !== 'production';
const dbUrl = isDev ? process.env.LOCAL_DATABASE_URL : process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

// 2. Configuration du Serveur (Le tuyau Web)
const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
const { ADDRESS = '0.0.0.0', PORT = '8032' } = process.env;

// 3. Liaison
app.decorate('prisma', prisma);

// const app = Fastify({logger: true}).withTypeProvider<ZodTypeProvider>();
// const { ADDRESS = '0.0.0.0', PORT = '8000' } = process.env;
// const adapter = new PrismaPg({ connectionString: process.env['LOCAL_DATABASE_URL'] });
// const prisma = new PrismaClient({ adapter });

  // sorte de portier qui va vérifier que les données envoyées dans la req correspondent bien au schéma Zod déclaré
  // si les données sont valides, il laisse passer la req et remplit res.body avec les données typées
  // si les donnée sont invalides, il bloque la req et renvoie une erreur 400 Bad Request au client
  app.setValidatorCompiler(validatorCompiler)
  // contrôleur qualité de nos responses
  // on définit un schéma Zod pour renvoyer des data dans les responses 200, le SerializerCompiler prend l'objet qu'on retourne
  // il le transforme en chaîne JSON en suivant le schema Zod. 
  // Si notre objet contient des data pas présentent dans le schéma, il ne les envoie pas au client
  app.setSerializerCompiler(serializerCompiler)


// routes
app.register(userRoutes, {prefix: 'api/users'})

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

start();


