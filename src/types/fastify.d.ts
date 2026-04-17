import { PrismaClient } from '@prisma/client';
import '@fastify/jwt';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        authenticate(req: FastifyRequest, reply: FastifyReply): Promise<void>
    }

    interface FastifyJWT {
        payload: {id: string}
        user: {id: string}
    }
}

