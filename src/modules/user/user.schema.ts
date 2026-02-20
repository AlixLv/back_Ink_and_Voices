import {z} from 'zod';
import {buildJsonSchemas} from 'fastify-type-provider-zod';

// data we need from the user to register
const createUserSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    username: z.string(),
})

// exporting the type to provide to the request body
export type CreateUserInput = z.infer<typeof createUserSchema>

// response schema for registering user
const createUsrResponseSchema = z.object({
    id: z.string().uuid(),
    email: z.email(),
    username: z.string(),
})

// we build our JSON schmeas and return them and a ref to refer these schemas
export const {schemas: userSchemas, $ref} = buildJsonSchemas({
    createUserSchema,
    createUsrResponseSchema,
})

