import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getBooksByStatusHandler, validateBookHandler } from './admin.controller.js';
import {
  getBooksResponseSchema,
  getBooksQuerySchema,
  validateBookParamsSchema,
  validateBookBodySchema,
  validateBookResponseSchema,
} from './admin.schema.js';

export async function adminRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // ?status=pending|validated|refused : les 3 sections du dashboard admin.
  server.get('/books', {
    preHandler: [app.authenticate, app.requireAdmin],
    schema: {
      description: 'list books by status, for the admin dashboard (admin only)',
      tags: ['admin'],
      querystring: getBooksQuerySchema,
      response: {
        200: getBooksResponseSchema.describe('Default response'),
      },
    },
  }, getBooksByStatusHandler);

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
