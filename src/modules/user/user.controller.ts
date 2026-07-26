import type { FastifyReply, FastifyRequest } from "fastify";


export async function getUserLogged(
    req: FastifyRequest, 
    reply: FastifyReply){
    const user = await req.server.prisma.user.findUnique({where: {id: req.user.id}}) 

    if (!user){
        return reply.code(404).send({message: "user non trouvé"})
    }

    return reply.code(200).send({
        id: user.id,
        email: user.email,
        username: user.username
    })
}

export async function updateUser(){
    // besoin vérifier AccessToken --> user est bien connecté
    // besoin vérifier userID --> user a bien le droit éditer le profil
}