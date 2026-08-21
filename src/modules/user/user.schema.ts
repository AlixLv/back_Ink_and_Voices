import {z} from 'zod';

export const AVATAR_IDS = ['inky-01', 'inky-02', 'inky-03', 'inky-04', 'inky-05', 'inky-06'] as const;

export const updateUserSchema = z.object({
    email: z.email().optional(),
    username: z.string().min(1).optional(),
    password: z.string().min(8).optional(),
    avatar: z.enum(AVATAR_IDS).nullable().optional(),
}).refine(
    (data) => data.email !== undefined || data.username !== undefined || data.password !== undefined || data.avatar !== undefined,
    { message: 'Au moins un champ doit être fourni.' }
)

export type UpdateUserProfile = z.infer<typeof updateUserSchema>

// reponse envoyée au front pour GET /me. Contrairement à la réponse du login,
// celle-ci inclut l'id : c'est la route qui fait foi pour "qui est connecté".
export const userProfileResponseSchema = z.object({
    id: z.string(),
    email: z.email(),
    username: z.string(),
    role: z.enum(['user', 'admin']),
    avatar: z.string().nullable(),
})

export const updateUserResponseSchema = z.object({
    email: z.email(),
    username: z.string(),
    requiresLogin: z.boolean(),
})

export const userIdParamsSchema = z.object({
    id: z.uuid(),
})

export const adminUserSchema = z.object({
    id: z.string(),
    email: z.email(),
    username: z.string(),
    role: z.enum(['user', 'admin']),
    created_at: z.date(),
    contributions_count: z.number(),
})

export const listUsersResponseSchema = z.array(adminUserSchema)

export const updateRoleSchema = z.object({
    role: z.enum(['user', 'admin']),
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>

export const messageResponseSchema = z.object({
    message: z.string(),
})
