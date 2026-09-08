import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getRecentBooksHandler, getBookHandler, createBookHandler, getMyBooksHandler } from './book.controller.js';
import { getBooksResponseSchema, singleBookResponseSchema, getBookParamsSchema, createBookSchema, createBookResponseSchema, getMyBooksResponseSchema } from './book.schema.js';

export async function bookRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', {
    schema: {
      description: 'homepage endpoint',
      tags: ['book'],
      response: {
        200: getBooksResponseSchema.describe('Default response'),
      },
    },
  }, getRecentBooksHandler);

  // Route statique "/mine" avant "/:id" (paramétrique) : Fastify les
  // distingue correctement quel que soit l'ordre, mais autant garder l'ordre
  // de lecture logique. "Mes contributions" (page profil) : tous les livres
  // suggérés par la personne connectée, quel que soit leur statut —
  // contrairement à GET / qui ne renvoie que les validés.
  server.get('/mine', {
    preHandler: [app.authenticate],
    schema: {
      description: 'list the logged-in user\'s own book suggestions, any status',
      tags: ['book'],
      response: {
        200: getMyBooksResponseSchema.describe('Default response'),
      },
    },
  }, getMyBooksHandler);

  server.get('/:id', {
    schema: {
      description: 'get single book endpoint',
      tags: ['book'],
      params: getBookParamsSchema,
      response: {
        200: singleBookResponseSchema.describe('Successful response')
      },
    }
  }, getBookHandler)

  // Même URL de collection que le GET /, méthode différente : suggestion
  // d'un livre par un·e utilisateurice connecté·e (status 'pending' par défaut).
  server.post('/', {
    preHandler: [app.authenticate],
    schema: {
      description: 'suggest a new book (pending admin validation)',
      tags: ['book'],
      body: createBookSchema,
      response: {
        201: createBookResponseSchema.describe('Book suggestion created'),
      },
    },
  }, createBookHandler);

  server.log.info('book routes registered');
}

