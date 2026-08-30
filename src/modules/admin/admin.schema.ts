import { z } from 'zod';
import { bookDetailSchema } from '../book/book.schema.js';

// Un livre (quel que soit son statut), avec en plus l'identité de la
// personne qui l'a suggéré (utile pour la review admin, pas exposé sur les
// routes publiques).
export const adminBookSchema = bookDetailSchema.extend({
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.email(),
  }),
});

export const getBooksResponseSchema = z.array(adminBookSchema);

// Dashboard admin : une section par statut (en attente / validés / refusés).
export const getBooksQuerySchema = z.object({
  status: z.enum(['pending', 'validated', 'refused']),
});

export type GetBooksQuery = z.infer<typeof getBooksQuerySchema>;

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
