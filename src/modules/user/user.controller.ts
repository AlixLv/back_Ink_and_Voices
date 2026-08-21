import type { FastifyReply, FastifyRequest } from "fastify";
import * as argon2 from 'argon2';
import { Prisma } from '../../generated/prisma/client.js';
import type { UpdateUserProfile, UpdateRoleInput } from "./user.schema.js";
import { z } from 'zod';
import type { userIdParamsSchema } from "./user.schema.js";
import { UserNotFoundError, ProfileConflictError, SelfRoleChangeError } from './user.errors.js';


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
        role: user.role,
        avatar: user.avatar
    })
}

export async function updateUser(
    req: FastifyRequest,
    reply: FastifyReply
){
    const { email, username, password, avatar } = req.body as UpdateUserProfile;

    const data: {email?: string; username?: string; password?: string; avatar?: string | null} = {};
    if (email) data.email = email;
    if (username) data.username = username;
    if (password) data.password = await argon2.hash(password);
    if (avatar !== undefined) data.avatar = avatar;

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

export async function deleteAccount(
    req: FastifyRequest,
    reply: FastifyReply
){
    const userId = req.user.id;

    const user = await req.server.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new UserNotFoundError();
    }

    await req.server.prisma.$transaction([
        req.server.prisma.book_validation.deleteMany({
            where: { OR: [{ admin_id: userId }, { book: { user_id: userId } }] },
        }),
        req.server.prisma.theme_book.deleteMany({
            where: { book: { user_id: userId } },
        }),
        req.server.prisma.book.deleteMany({ where: { user_id: userId } }),
        req.server.prisma.user.delete({ where: { id: userId } }),
    ]);

    reply.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });

    return reply.code(200).send({ message: 'Compte et données associées supprimés.' });
}

export async function listUsers(
    req: FastifyRequest,
    reply: FastifyReply
){
    const users = await req.server.prisma.user.findMany({
        orderBy: { created_at: 'asc' },
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            created_at: true,
            _count: { select: { book_suggestions: true } },
        },
    });

    type AdminUserRow = Prisma.userGetPayload<{
        select: {
            id: true;
            email: true;
            username: true;
            role: true;
            created_at: true;
            _count: { select: { book_suggestions: true } };
        };
    }>;

    const formatted = users.map((user: AdminUserRow) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        created_at: user.created_at,
        contributions_count: user._count.book_suggestions,
    }));

    return reply.code(200).send(formatted);
}

export async function getUserDetail(
    req: FastifyRequest,
    reply: FastifyReply
){
    const { id } = req.params as z.infer<typeof userIdParamsSchema>;

    const user = await req.server.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            created_at: true,
            _count: { select: { book_suggestions: true } },
        },
    });

    if (!user) {
        throw new UserNotFoundError();
    }

    return reply.code(200).send({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        created_at: user.created_at,
        contributions_count: user._count.book_suggestions,
    });
}

export async function updateUserRole(
    req: FastifyRequest,
    reply: FastifyReply
){
    const { id } = req.params as z.infer<typeof userIdParamsSchema>;
    const { role } = req.body as UpdateRoleInput;

    if (id === req.user.id) {
        throw new SelfRoleChangeError();
    }

    const user = await req.server.prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new UserNotFoundError();
    }

    const updated = await req.server.prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            created_at: true,
            _count: { select: { book_suggestions: true } },
        },
    });

    return reply.code(200).send({
        id: updated.id,
        email: updated.email,
        username: updated.username,
        role: updated.role,
        created_at: updated.created_at,
        contributions_count: updated._count.book_suggestions,
    });
}
