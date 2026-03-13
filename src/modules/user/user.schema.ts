import {z} from 'zod';

// data/input du user dont on a besoin pour la creation de compte
export const createUserSchema = z.object({
    email: z.email(),
    username: z.string(),
    password: z.string().min(8),
})

// creation du type TypeScript à partir du schema Zod
export type CreateUserInput = z.infer<typeof createUserSchema>

// schema de reponse envoyé au front une fois le user registered
export const createUserResponseSchema = z.object({
    email: z.email(),
    username: z.string(),
})



