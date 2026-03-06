import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CreateUserInput, LoginUserInput } from './user.schema.js';
import * as argon2 from 'argon2';


export async function signUp(
    req: FastifyRequest<{Body: CreateUserInput}>,
    reply: FastifyReply
){
    const { email, username, password } = req.body;
    const isUser = await req.server.prisma.user.findUnique({
        where: {
            email: email,
        },
    })
    if (isUser) {
        return reply.code(409).send({
            message: 'A user already exists with this email.',
        })
    }
    try {
        const hashPassword = await argon2.hash(password);
        const user = await req.server.prisma.user.create({
            data: {
                email,
                username,
                password: hashPassword,
            }
        })
        return reply.code(201).send(user)
    } catch (e){
        return reply.code(500).send(e)
    }
}


export async function loginUserHandler(
    req: FastifyRequest<{Body: LoginUserInput}>,
    reply: FastifyReply
){
    const { email, password } = req.body;
    const isUser = await req.server.prisma.user.findUnique({  //prisma recherche dans la table user
      where: {
        email: email,
    },
    })
    if (!isUser) {
        reply.send({ message : "ce user n'existe pas en db"})
    } else {
        reply.send({ message : `utilisateur récupéré : ${email}, ${password}` })
    }
}
