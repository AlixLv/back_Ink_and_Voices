import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getThemesHandler } from './theme.controller.js';
import { getThemesResponseSchema } from './theme.schema.js';

export async function themeRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', {
    schema: {
      description: 'list available book themes',
      tags: ['theme'],
      response: {
        200: getThemesResponseSchema.describe('Default response'),
      },
    },
  }, getThemesHandler);

  server.log.info('theme routes registered');
}
