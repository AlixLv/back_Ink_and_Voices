import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getThemesHandler, createThemeHandler } from './theme.controller.js';
import { getThemesResponseSchema, createThemeSchema, themeSchema } from './theme.schema.js';

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

  server.post('/', {
    preHandler: [app.authenticate],
    schema: {
      description: 'suggest a new book theme',
      tags: ['theme'],
      body: createThemeSchema,
      response: {
        201: themeSchema.describe('Theme created'),
      },
    },
  }, createThemeHandler);

  server.log.info('theme routes registered');
}
