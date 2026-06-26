import type { FastifyReply, FastifyRequest } from "fastify";
import * as argon2 from 'argon2';
import { updateUserSchema } from "./user.schema";


export async function getUserLogged(
    req: FastifyRequest, 
    reply: FastifyReply){
    const user = await req.server.prisma.user.findUnique({where: {id: req.user.id}}) 

    if (!user){
        return reply.code(404).send({message: "utilisateur.ice non reconnu.e"})
    }

    return reply.code(200).send({
        email: user.email, 
        username: user.username
    })
}

export async function updateUser(
    req: FastifyRequest <{Body: updateUserSchema}>,
    reply: FastifyReply
){
    const { email, username, password } = req.body;
        try {
            const hashPassword = await argon2.hash(password);
            const update_user = await req.server.prisma.user.update({
                where: {id: req.user.id},
                data: {
                    email,
                    username,
                    password: hashPassword,
                }
            }) 
            return reply.code(201).send(update_user)  
        } catch (e) {
            return reply.code(500).send({
                message: "🚨 an error occured",
                error: e instanceof Error ? e.message: String(e)
            } )
        }


}