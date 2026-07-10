import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getRecentBooksHandler, getBookHandler } from './book.controller.js';
import { getBooksResponseSchema, getSingleBook, getBookParamsSchema } from './book.schema.js';

export async function bookRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', {
    schema: {
      response: {
        200: getBooksResponseSchema,
      },
    },
  }, getRecentBooksHandler);

  server.get('/book/:id', {
    schema: {
      params: getBookParamsSchema,
      response: {
        200: getSingleBook
      },
    }
  }, getBookHandler)

  server.log.info('book routes registered');
}

