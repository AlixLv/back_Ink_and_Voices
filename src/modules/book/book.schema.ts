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

// "Mes contributions" (page profil) : les suggestions de l'utilisateurice
// connecté·e, quel que soit leur statut (contrairement à GET /books qui ne
// renvoie que les validés). status inclus pour que le front affiche
// "en attente"/"validé"/"refusé" plutôt qu'un badge fixe.
export const myBookSchema = bookDetailSchema.extend({
  status: z.enum(['pending', 'validated', 'refused']),
});

export const getMyBooksResponseSchema = z.array(myBookSchema);