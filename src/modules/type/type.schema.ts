import { z } from 'zod';

export const typeSchema = z.object({
  id: z.number(),
  type_name: z.string(),
  url_image: z.string().nullable(),
});

export const getTypesResponseSchema = z.array(typeSchema);
