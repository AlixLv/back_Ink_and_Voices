import type { FastifyReply, FastifyRequest } from "fastify";
import * as argon2 from 'argon2';
import type { UpdateUserProfile } from "./user.schema";


export async function getUserLogged(
    req: FastifyRequest, 
    reply: FastifyReply){
    const user = await req.server.prisma.user.findUnique({where: {id: req.user.id}}) 

    if (!user){
        return reply.code(404).send({message: "utilisateur.ice non reconnu.e"})
    }

    return reply.code(200).send({
        email: user.email, 
        username: user.username,
        requiresLogin: false
    })
}

export async function updateUser(
    req: FastifyRequest <{Body: UpdateUserProfile}>,
    reply: FastifyReply
){
    const { email, username, password } = req.body;
        try {
            const dataToUdpate: {email?: string; username?: string; password?: string} = {};
            
            if(email) dataToUdpate.email = email;
            if (username) dataToUdpate.username = username;
            if (password) dataToUdpate.password = await argon2.hash(password);

            const updateUser = await req.server.prisma.user.update({
                where: {id: req.user.id},
                data: dataToUdpate
            }) 

            if(password){
                reply.clearCookie('access_token', {path: '/'});
                return reply.code(200).send({
                    email: updateUser.email,
                    username: updateUser.username,
                    requiresLogin: true
                })
            } else {
                return reply.code(200).send({
                    email: updateUser.email,
                    username: updateUser.username,
                    requiresLogin: false
                })
            } 
        } catch (e) {
            return reply.code(500).send({
                message: "🚨 an error occured",
                error: e instanceof Error ? e.message: String(e)
            } )
        }
}