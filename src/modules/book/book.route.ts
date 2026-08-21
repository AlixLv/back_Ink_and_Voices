import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getRecentBooksHandler, getBookHandler, createBookHandler, getPendingBooksHandler, validateBookHandler, getMyContributionsHandler, getValidationHistoryHandler, updateBookHandler, deleteBookHandler } from './book.controller.js';
import { getBooksResponseSchema, singleBookResponseSchema, getBookParamsSchema, createBookSchema, createBookResponseSchema, pendingBooksResponseSchema, validateBookSchema, validateBookResponseSchema, getBooksQuerySchema, myContributionsResponseSchema, validationHistoryResponseSchema, updateBookSchema, deleteBookResponseSchema } from './book.schema.js';

export async function bookRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', {
    schema: {
      description: 'list validated books, optionally filtered by search, type or theme',
      tags: ['book'],
      querystring: getBooksQuerySchema,
      response: {
        200: getBooksResponseSchema.describe('Default response'),
      },
    },
  }, getRecentBooksHandler);

  server.get('/mine', {
    preHandler: [app.authenticate],
    schema: {
      description: 'list the books suggested by the connected user',
      tags: ['book'],
      response: {
        200: myContributionsResponseSchema.describe('My contributions'),
      },
    },
  }, getMyContributionsHandler);

  server.get('/validations', {
    preHandler: [app.authenticate, app.isAdmin],
    schema: {
      description: 'validation decisions history (admin only)',
      tags: ['book'],
      response: {
        200: validationHistoryResponseSchema.describe('Validation history'),
      },
    },
  }, getValidationHistoryHandler);

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

  server.put('/:id', {
    preHandler: [app.authenticate],
    schema: {
      description: 'update one of your own pending suggestions',
      tags: ['book'],
      params: getBookParamsSchema,
      body: updateBookSchema,
      response: {
        200: singleBookResponseSchema.describe('Updated suggestion'),
      },
    },
  }, updateBookHandler);

  server.delete('/:id', {
    preHandler: [app.authenticate],
    schema: {
      description: 'withdraw one of your own pending suggestions',
      tags: ['book'],
      params: getBookParamsSchema,
      response: {
        200: deleteBookResponseSchema.describe('Suggestion deleted'),
      },
    },
  }, deleteBookHandler);

  server.log.info('book routes registered');
}

