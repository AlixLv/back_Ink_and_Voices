import { z } from 'zod';

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