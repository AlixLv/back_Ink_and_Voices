import {z} from 'zod';

// data/input du user 
export const updateUserSchema = z.object({
    email: z.string(),
    username: z.string(),
    password: z.string().min(8),
})

export type UpdateUserProfile = z.infer<typeof updateUserSchema>

// reponse envoyée au front
export const userProfileResponseSchema = z.object({
    id: z.string(),
    email: z.email(),
    username: z.string(),
})