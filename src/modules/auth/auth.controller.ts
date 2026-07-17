import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CreateUserInput, LoginUserInput } from './auth.schema.js';
import * as argon2 from 'argon2';
import fCookie from '@fastify/cookie';
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

// Le cookie access_token est httpOnly : le front ne peut pas le supprimer
// lui-même, c'est donc au backend d'y mettre fin. Sans ça, "se déconnecter"
// ne fait que vider l'affichage pendant que la session reste ouverte ici.
// Les options doivent correspondre à celles du setCookie du login, sinon le
// navigateur ne reconnaît pas le cookie à supprimer.
export async function logoutHandler(
    _req: FastifyRequest,
    reply: FastifyReply
){
    reply.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    return reply.code(200).send({ message: 'Déconnexion réussie' });
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
                const token = req.server.jwt.sign({ id: user.id });
                reply.setCookie('access_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // dev
                    sameSite: 'strict',
                    maxAge: 14 * 24 * 60 * 60, // 14 jours en secondes
                    path: '/'
                })
                // Le token n'est PAS renvoyé dans le body : il ne voyage que
                // dans le cookie httpOnly ci-dessus, hors de portée de JS.
                return reply.code(200).send({ email: user.email, username: user.username });
            } else {
                return reply.code(404).send({message: "email ou mot de passe incorrect"})
            }
        } catch(e){
            return reply.code(500).send(e);
        }
    }
}
