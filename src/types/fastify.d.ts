import { PrismaClient } from '@prisma/client';
import '&fastify/jwt';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        authenticate(req: FastifyRequest, reply: FastifyReply): Promise<void>
        // À utiliser après authenticate (a besoin de req.user.id) : vérifie le
        // rôle en base à chaque requête plutôt que de faire confiance à un
        // rôle embarqué dans le JWT (qui resterait valide jusqu'à expiration
        // même après une rétrogradation).
        requireAdmin(req: FastifyRequest, reply: FastifyReply): Promise<void>
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {id: string}
        user: {id: string}
    }
}