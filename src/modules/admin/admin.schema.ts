import { z } from 'zod';
import { bookDetailSchema } from '../book/book.schema.js';

// Un livre en attente, avec en plus l'identité de la personne qui l'a
// suggéré (utile pour la review admin, pas exposé sur les routes publiques).
export const pendingBookSchema = bookDetailSchema.extend({
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.email(),
  }),
});

export const getPendingBooksResponseSchema = z.array(pendingBookSchema);

export const validateBookParamsSchema = z.object({
  id: z.coerce.number(),
});

export type ValidateBookParams = z.infer<typeof validateBookParamsSchema>;

// 'pending' n'est pas une décision valide : uniquement validated/refused ici,
// même si book_validation.status réutilise en base le même enum que book.status.
export const validateBookBodySchema = z.object({
  status: z.enum(['validated', 'refused']),
  comment: z.string().nullable().default(null),
});

export type ValidateBookInput = z.infer<typeof validateBookBodySchema>;

export const validateBookResponseSchema = bookDetailSchema;
