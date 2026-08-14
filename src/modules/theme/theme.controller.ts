import type { FastifyReply, FastifyRequest } from 'fastify';

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
