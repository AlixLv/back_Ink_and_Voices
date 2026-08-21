import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getTypesHandler, createTypeHandler } from './type.controller.js';
import { getTypesResponseSchema, createTypeSchema, typeSchema } from './type.schema.js';

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

  server.post('/', {
    preHandler: [app.authenticate],
    schema: {
      description: 'suggest a new book type (genre)',
      tags: ['type'],
      body: createTypeSchema,
      response: {
        201: typeSchema.describe('Type created'),
      },
    },
  }, createTypeHandler);

  server.log.info('type routes registered');
}
