import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getRecentBooksHandler, getBookHandler } from './book.controller.js';
import { getBooksResponseSchema, singleBookResponseSchema, getBookParamsSchema } from './book.schema.js';

export async function bookRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', {
    schema: {
      response: {
        200: getBooksResponseSchema,
      },
    },
  }, getRecentBooksHandler);

  server.get('/:id', {
    schema: {
      params: getBookParamsSchema,
      response: {
        200: singleBookResponseSchema
      },
    }
  }, getBookHandler)

  server.log.info('book routes registered');
}

