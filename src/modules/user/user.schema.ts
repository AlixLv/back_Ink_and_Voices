import {z} from 'zod';

// data/input du user 
export const updateUserSchema = z.object({
    email: z.string(),
    username: z.string(),
    password: z.string().min(8),
})

export type UpdateUserProfile = z.infer<typeof updateUserSchema>

// reponse envoyée au front pour GET /me. Contrairement à la réponse du login,
// celle-ci inclut l'id : c'est la route qui fait foi pour "qui est connecté".
export const userProfileResponseSchema = z.object({
    id: z.string(),
    email: z.email(),
    username: z.string(),
})