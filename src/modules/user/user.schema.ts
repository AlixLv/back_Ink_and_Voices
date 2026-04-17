import {z} from 'zod';

export const userProfileResponseSchema = z.object({
    email: z.email(),
    username: z.string(),
})

export const updateUserSchema = z.object({
    email: z.string(),
    username: z.string(),
    password: z.string().min(8),
})

export type UpdateUserProfile = z.infer<typeof updateUserSchema>

