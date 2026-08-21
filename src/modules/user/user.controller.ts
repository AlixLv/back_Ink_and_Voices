import type { FastifyReply, FastifyRequest } from "fastify";
import * as argon2 from 'argon2';
import { Prisma } from '../../generated/prisma/client.js';
import type { UpdateUserProfile } from "./user.schema.js";
import { UserNotFoundError, ProfileConflictError } from './user.errors.js';


export async function getUserLogged(
    req: FastifyRequest,
    reply: FastifyReply){
    const user = await req.server.prisma.user.findUnique({where: {id: req.user.id}})

    if (!user){
        throw new UserNotFoundError();
    }

    // id renvoyé ici (contrairement au login) car cette route sert justement
    // à dire "voici qui tu es" : le front s'en sert pour construire /profile/:id.
    return reply.code(200).send({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
    })
}

export async function updateUser(
    req: FastifyRequest,
    reply: FastifyReply
){
    const { email, username, password } = req.body as UpdateUserProfile;

    const data: {email?: string; username?: string; password?: string} = {};
    if (email) data.email = email;
    if (username) data.username = username;
    if (password) data.password = await argon2.hash(password);

    let updatedUser;
    try {
        updatedUser = await req.server.prisma.user.update({
            where: {id: req.user.id},
            data
        })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ProfileConflictError();
        }
        throw e;
    }

    if (password) {
        reply.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
    }

    return reply.code(200).send({
        email: updatedUser.email,
        username: updatedUser.username,
        requiresLogin: Boolean(password)
    })
}
