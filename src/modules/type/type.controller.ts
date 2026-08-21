import type { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '../../generated/prisma/client.js';
import { ConflictError } from '../../errors/ApiError.js';
import type { CreateTypeInput } from './type.schema.js';


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

export async function createTypeHandler(req: FastifyRequest, reply: FastifyReply) {
  const { type_name } = req.body as CreateTypeInput;

  let type;
  try {
    type = await req.server.prisma.type.create({
      data: { type_name },
      select: { id: true, type_name: true, url_image: true },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictError('Ce genre existe déjà.');
    }
    throw e;
  }

  return reply.code(201).send(type);
}
