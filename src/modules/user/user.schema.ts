import {z} from 'zod';

// data/input du user 
export const updateUserSchema = z.object({
    email: z.email().optional(), 
    username: z.string().optional(),
    password: z.string().min(8).optional(),
})

export type UpdateUserProfile = z.infer<typeof updateUserSchema>

// reponse envoyée au front
export const userProfileResponseSchema = z.object({
    email: z.email(),
    username: z.string(),
    requiresLogin: z.boolean(),
})