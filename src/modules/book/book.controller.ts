import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Prisma } from '../../generated/prisma/client';
import type { getBookParamsSchema, bookDetailSchema } from './book.schema';
import { z } from 'zod';
import { BookNotFoundError, BookFetchError } from './book.error';

type BookWithRelations = Prisma.bookGetPayload<{
  select: {
    id: true;
    title: true;
    author: true;
    short_description: true;
    reference_link: true;
    created_at: true;
    type: { select: { id: true; type_name: true; url_image: true } };
    themes: { select: { theme: { select: { id: true; theme_name: true } } } };
  };
}>;

export async function getRecentBooksHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  let books;
  try {
    books = await req.server.prisma.book.findMany({
      where: {
        status: 'validated',
      },
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        title: true,
        author: true,
        short_description: true,
        reference_link: true,
        created_at: true,
        type: {
          select: {
            id: true,
            type_name: true,
            url_image: true,
          },
        },
        themes: {
          select: {
            theme: {
              select: {
                id: true,
                theme_name: true,
              },
            },
          },
        },
      },
    });
  } catch (e) {
    req.log.error(e);
    throw new BookFetchError();
  }
  
  const formatted = books.map((book: BookWithRelations) => ({
    ...book,
    themes: book.themes.map((t: { theme: { id: number; theme_name: string } }) => t.theme),
  }));

  return reply.code(200).send(formatted);

}

export async function getBookHandler(
  req: FastifyRequest<{Params: z.infer<typeof getBookParamsSchema>}>,
  reply: FastifyReply
  ){
    const { id } = req.params;

    const book = await req.server.prisma.book.findUnique({
      where: { id },
      include: {
        type: true,
        themes: {
          include: { theme: true },
          },
        },
    });

      if (!book){
        throw new BookNotFoundError();
      }
  
    const result = {
      id: book.id,
      title: book.title,
      author: book.author,
      short_description: book.short_description,
      publishing_house: book.publishing_house,
      publication_year: book.publication_year,
      resume: book.resume,
      reference_link: book.reference_link,
      created_at: book.created_at,
      type: book.type,
      themes: book.themes.map((t: { theme: {id: number; theme_name: string}}) => t.theme),
    };
    return reply.code(200).send(result);
}
