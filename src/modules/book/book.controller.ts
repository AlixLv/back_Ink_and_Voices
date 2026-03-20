import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Prisma } from '../../generated/prisma/client';
import type { Book } from './book.schema';

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
  try {
    const books = await req.server.prisma.book.findMany({
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


    const formatted = books.map((book: BookWithRelations) => ({
      ...book,
      themes: book.themes.map((t: { theme: { id: number; theme_name: string } }) => t.theme),
    }));

    return reply.code(200).send(formatted);
  } catch (e) {
    req.log.error(e);
    return reply.code(500).send({ message: 'Failed to fetch books' });
  }
}