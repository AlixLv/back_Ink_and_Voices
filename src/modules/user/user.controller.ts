import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CreateUserInput } from './user.schema.js';

const SALT_ROUNDS = 10

export async function registerUserHandler(
    req: FastifyRequest<{Body: CreateUserInput}>,
    reply: FastifyReply
){
    const { email, username, password } = req.body;

    try {
        const user = await req.server.prisma.user.create({
            data: {
                email,
                username,
                password,
            }
        })
        return reply.code(201).send(user)
    } catch (e){
        return reply.code(500).send(e)
    }
}