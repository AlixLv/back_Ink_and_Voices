import {z} from 'zod';

// data we need from the user to register
export const createUserSchema = z.object({
    email: z.email(),
    username: z.string(),
    password: z.string().min(8),
})

// création du type TypeScript à partir du schéma Zod
export type CreateUserInput = z.infer<typeof createUserSchema>

// response schema for registering user
export const createUserResponseSchema = z.object({
    email: z.email(),
    username: z.string(),
})



