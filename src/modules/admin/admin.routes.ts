import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getPendingBooksHandler, validateBookHandler } from './admin.controller.js';
import {
  getPendingBooksResponseSchema,
  validateBookParamsSchema,
  validateBookBodySchema,
  validateBookResponseSchema,
} from './admin.schema.js';

export async function adminRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/books/pending', {
    preHandler: [app.authenticate, app.requireAdmin],
    schema: {
      description: 'list books pending validation (admin only)',
      tags: ['admin'],
      response: {
        200: getPendingBooksResponseSchema.describe('Default response'),
      },
    },
  }, getPendingBooksHandler);

  server.post('/books/:id/validate', {
    preHandler: [app.authenticate, app.requireAdmin],
    schema: {
      description: 'validate or refuse a pending book suggestion (admin only)',
      tags: ['admin'],
      params: validateBookParamsSchema,
      body: validateBookBodySchema,
      response: {
        200: validateBookResponseSchema.describe('Book updated'),
      },
    },
  }, validateBookHandler);

  server.log.info('admin routes registered');
}
