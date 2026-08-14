import type { FastifyReply, FastifyRequest } from 'fastify';

export async function getTypesHandler(req: FastifyRequest, reply: FastifyReply) {
  const types = await req.server.prisma.type.findMany({
    orderBy: { type_name: 'asc' },
    select: {
      id: true,
      type_name: true,
      url_image: true,
    },
  });

  return reply.code(200).send(types);
}
