import { number, z } from 'zod';

export const bookSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  short_description: z.string(),
  reference_link: z.string().nullable(),
  created_at: z.date(),
  type: z.object({
    id: z.number(),
    type_name: z.string(),
    url_image: z.string().nullable(),
  }),
  themes: z.array(
    z.object({
      id: z.number(),
      theme_name: z.string(),
    })
  ),
});

export const getBooksResponseSchema = z.array(bookSchema);

export type Book = z.infer<typeof bookSchema>;

// validation du type du paramètre id
export const getBookParamsSchema = z.object({
  id: z.coerce.number()
})

// detailed book view
export const bookDetailSchema = bookSchema.extend({
  publishing_house: z.string(),
  publication_year: z.string().nullable(),
  resume: z.string().nullable(),
});

export const singleBookResponseSchema = bookDetailSchema;

// suggestion d'un livre par un·e utilisateurice connecté·e. Pas de status ni
// de user_id ici : status vaut 'pending' par défaut côté DB, et user_id vient
// du cookie JWT (req.user.id), jamais du body envoyé par le client.
// .default() plutôt que .optional() sur les champs nullables : omettable côté
// client, mais toujours présent (jamais `undefined`) dans le type inféré —
// requis par exactOptionalPropertyTypes (tsconfig).
export const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  publishing_house: z.string().min(1),
  short_description: z.string().min(1),
  publication_year: z.string().nullable().default(null),
  resume: z.string().nullable().default(null),
  reference_link: z.string().nullable().default(null),
  type_id: z.number(),
  theme_ids: z.array(z.number()).default([]),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;

export const createBookResponseSchema = bookDetailSchema;

export const pendingBooksResponseSchema = z.array(bookDetailSchema);

export const validateBookSchema = z.object({
  status: z.enum(['validated', 'refused']),
  comment: z.string().nullable().default(null),
});

export type ValidateBookInput = z.infer<typeof validateBookSchema>;

export const validateBookResponseSchema = z.object({
  id: z.number(),
  status: z.enum(['validated', 'refused']),
  comment: z.string().nullable(),
});

export const getBooksQuerySchema = z.object({
  search: z.string().trim().min(1).max(200).optional(),
  type_id: z.coerce.number().int().positive().optional(),
  theme_id: z.coerce.number().int().positive().optional(),
});

export type GetBooksQuery = z.infer<typeof getBooksQuerySchema>;

export const myContributionSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  short_description: z.string(),
  status: z.enum(['pending', 'validated', 'refused']),
  created_at: z.date(),
  type: z.object({
    id: z.number(),
    type_name: z.string(),
  }),
  validation_comment: z.string().nullable(),
});

export const myContributionsResponseSchema = z.array(myContributionSchema);

export const validationHistoryItemSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'validated', 'refused']),
  comment: z.string().nullable(),
  validation_date: z.date(),
  book: z.object({
    id: z.number(),
    title: z.string(),
    author: z.string(),
  }),
  admin: z.object({
    username: z.string(),
  }),
});

export const validationHistoryResponseSchema = z.array(validationHistoryItemSchema);
export const updateBookSchema = createBookSchema;

export type UpdateBookInput = z.infer<typeof updateBookSchema>;

export const deleteBookResponseSchema = z.object({
  message: z.string(),
});
