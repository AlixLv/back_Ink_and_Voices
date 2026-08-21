import type { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '../../generated/prisma/client.js';
import { ConflictError } from '../../errors/ApiError.js';
import type { CreateThemeInput } from './theme.schema.js';


export async function getThemesHandler(req: FastifyRequest, reply: FastifyReply) {
  const themes = await req.server.prisma.theme.findMany({
    orderBy: { theme_name: 'asc' },
    select: {
      id: true,
      theme_name: true,
    },
  });

  return reply.code(200).send(themes);
}

export async function createThemeHandler(req: FastifyRequest, reply: FastifyReply) {
  const { theme_name } = req.body as CreateThemeInput;

  let theme;
  try {
    theme = await req.server.prisma.theme.create({
      data: { theme_name },
      select: { id: true, theme_name: true },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictError('Ce thème existe déjà.');
    }
    throw e;
  }

  return reply.code(201).send(theme);
}
