import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getRecentBooksHandler, getBookHandler, createBookHandler, getPendingBooksHandler, validateBookHandler } from './book.controller.js';
import { getBooksResponseSchema, singleBookResponseSchema, getBookParamsSchema, createBookSchema, createBookResponseSchema, pendingBooksResponseSchema, validateBookSchema, validateBookResponseSchema } from './book.schema.js';

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

  server.get('/pending', {
    preHandler: [app.authenticate, app.isAdmin],
    schema: {
      description: 'list books awaiting validation (admin only)',
      tags: ['book'],
      response: {
        200: pendingBooksResponseSchema.describe('Pending books list'),
      },
    },
  }, getPendingBooksHandler);

  server.patch('/:id/validate', {
    preHandler: [app.authenticate, app.isAdmin],
    schema: {
      description: 'validate or refuse a suggested book (admin only)',
      tags: ['book'],
      params: getBookParamsSchema,
      body: validateBookSchema,
      response: {
        200: validateBookResponseSchema.describe('Validation recorded'),
      },
    },
  }, validateBookHandler);

  server.log.info('book routes registered');
}

