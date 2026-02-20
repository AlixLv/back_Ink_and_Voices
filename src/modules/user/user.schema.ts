import {z} from 'zod';

// data we need from the user to register
export const createUserSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    username: z.string(),
})

// response schema for registering user
export const createUserResponseSchema = z.object({
    email: z.email(),
    username: z.string(),
})



