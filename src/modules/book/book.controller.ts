import type { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '../../generated/prisma/client.js';
import type { getBookParamsSchema, bookDetailSchema, CreateBookInput, ValidateBookInput } from './book.schema';
import { z } from 'zod';
import { BookNotFoundError, BookFetchError, BookCreateError, BookAlreadyExistsError, InvalidBookReferenceError } from './book.error';

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

export async function createBookHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const {
    title,
    author,
    publishing_house,
    short_description,
    publication_year,
    resume,
    reference_link,
    type_id,
    theme_ids,
  } = req.body as CreateBookInput;

  let book;
  try {
    book = await req.server.prisma.book.create({
      data: {
        title,
        author,
        publishing_house,
        short_description,
        publication_year,
        resume,
        reference_link,
        type: { connect: { id: type_id } },
        user: { connect: { id: req.user.id } },
        themes: {
          create: theme_ids.map((theme_id) => ({ theme: { connect: { id: theme_id } } })),
        },
      },
      include: {
        type: true,
        themes: { include: { theme: true } },
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') throw new BookAlreadyExistsError();
      if (e.code === 'P2003' || e.code === 'P2025') throw new InvalidBookReferenceError();
    }
    req.log.error(e);
    throw new BookCreateError();
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
    themes: book.themes.map((t: { theme: { id: number; theme_name: string } }) => t.theme),
  };
  return reply.code(201).send(result);
}

export async function getPendingBooksHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  let books;
  try {
    books = await req.server.prisma.book.findMany({
      where: { status: 'pending' },
      orderBy: { created_at: 'asc' },
      include: {
        type: true,
        themes: { include: { theme: true } },
      },
    });
  } catch (e) {
    req.log.error(e);
    throw new BookFetchError();
  }

  type PendingBook = Prisma.bookGetPayload<{
    include: {
      type: true;
      themes: { include: { theme: true } };
    };
  }>;

  const formatted = books.map((book: PendingBook) => ({
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
    themes: book.themes.map((t: { theme: { id: number; theme_name: string } }) => t.theme),
  }));

  return reply.code(200).send(formatted);
}

export async function validateBookHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = req.params as z.infer<typeof getBookParamsSchema>;
  const { status, comment } = req.body as ValidateBookInput;

  const book = await req.server.prisma.book.findUnique({ where: { id } });
  if (!book) {
    throw new BookNotFoundError();
  }

  const [, validation] = await req.server.prisma.$transaction([
    req.server.prisma.book.update({
      where: { id },
      data: { status },
    }),
    req.server.prisma.book_validation.create({
      data: {
        book_id: id,
        admin_id: req.user.id,
        status,
        comment,
      },
    }),
  ]);

  return reply.code(200).send({
    id: validation.book_id,
    status: validation.status,
    comment: validation.comment,
  });
}
