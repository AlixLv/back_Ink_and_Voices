import { z } from 'zod';

export const typeSchema = z.object({
  id: z.number(),
  type_name: z.string(),
  url_image: z.string().nullable(),
});

export const getTypesResponseSchema = z.array(typeSchema);

export const createTypeSchema = z.object({
  type_name: z.string().trim().min(1).max(100),
});

export type CreateTypeInput = z.infer<typeof createTypeSchema>;
