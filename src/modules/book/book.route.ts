import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getRecentBooksHandler } from './book.controller.js';
import { getBooksResponseSchema } from './book.schema.js';

export async function bookRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', {
    schema: {
      response: {
        200: getBooksResponseSchema,
      },
    },
  }, getRecentBooksHandler);

  server.log.info('book routes registered');
}