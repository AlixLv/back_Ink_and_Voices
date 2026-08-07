import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getRecentBooksHandler, getBookHandler } from './book.controller.js';
import { getBooksResponseSchema, singleBookResponseSchema, getBookParamsSchema } from './book.schema.js';

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

  server.log.info('book routes registered');
}

