import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getTypesHandler } from './type.controller.js';
import { getTypesResponseSchema } from './type.schema.js';

export async function typeRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', {
    schema: {
      description: 'list available book types (genres)',
      tags: ['type'],
      response: {
        200: getTypesResponseSchema.describe('Default response'),
      },
    },
  }, getTypesHandler);

  server.log.info('type routes registered');
}
