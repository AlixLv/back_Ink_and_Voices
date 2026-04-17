import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CreateUserInput, LoginUserInput } from './auth.schema.js';
import * as argon2 from 'argon2';
import { is } from 'zod/v4/locales';


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


// pour l'instant, on vérifie s'il y a un user avec cet email. Si c'est le cas, on revoie un message "user récupéré" avec email et pw de la requête
export async function loginUserHandler(
    req: FastifyRequest<{Body: LoginUserInput}>,
    reply: FastifyReply
){
    const { email, password } = req.body;
    const user = await req.server.prisma.user.findUnique({  //prisma recherche dans la table user
      where: {
        email: email,
    },
    })
    if (!user) {
        return reply.code(404).send({ message: "ce user n'existe pas en db"});
    } else {
        try {
            const hashPassword = user.password;
            if (await argon2.verify(hashPassword, password)) {
                const token = req.server.jwt.sign({ email: user.email, username: user.username });
                return reply.code(200).send({ email: user.email, username: user.username, token });
            } else {
                return reply.code(404).send({message: "email ou mot de passe incorrect"})
            }
        } catch(e){
            return reply.code(500).send(e);
        }
    }
}
