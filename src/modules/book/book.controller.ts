import type { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '../../generated/prisma/client.js';
import type { getBookParamsSchema, bookDetailSchema, CreateBookInput, UpdateBookInput, ValidateBookInput, GetBooksQuery } from './book.schema';
import { z } from 'zod';
import { BookNotFoundError, BookFetchError, BookCreateError, BookAlreadyExistsError, InvalidBookReferenceError, NotBookOwnerError, BookNotEditableError } from './book.error';

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
  const { search, type_id, theme_id, page, limit } = req.query as GetBooksQuery;

  const where: Prisma.bookWhereInput = { status: 'validated' };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (type_id) {
    where.type_id = type_id;
  }
  if (theme_id) {
    where.themes = { some: { theme_id } };
  }

  let books;
  let total;
  try {
    total = await req.server.prisma.book.count({ where });
    books = await req.server.prisma.book.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
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

  return reply.code(200).send({
    items: formatted,
    total,
    page,
    page_count: Math.max(1, Math.ceil(total / limit)),
  });

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

export async function getMyContributionsHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  let books;
  try {
    books = await req.server.prisma.book.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      include: {
        type: { select: { id: true, type_name: true } },
        validations: {
          orderBy: { validation_date: 'desc' },
          take: 1,
          select: { comment: true },
        },
      },
    });
  } catch (e) {
    req.log.error(e);
    throw new BookFetchError();
  }

  type ContributionBook = Prisma.bookGetPayload<{
    include: {
      type: { select: { id: true; type_name: true } };
      validations: { select: { comment: true } };
    };
  }>;

  const formatted = books.map((book: ContributionBook) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    short_description: book.short_description,
    status: book.status,
    created_at: book.created_at,
    type: book.type,
    validation_comment: book.validations[0]?.comment ?? null,
  }));

  return reply.code(200).send(formatted);
}

export async function getValidationHistoryHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  let validations;
  try {
    validations = await req.server.prisma.book_validation.findMany({
      orderBy: { validation_date: 'desc' },
      include: {
        book: { select: { id: true, title: true, author: true } },
        admin: { select: { username: true } },
      },
    });
  } catch (e) {
    req.log.error(e);
    throw new BookFetchError();
  }

  return reply.code(200).send(validations);
}

export async function updateBookHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = req.params as z.infer<typeof getBookParamsSchema>;
  const input = req.body as UpdateBookInput;

  const book = await req.server.prisma.book.findUnique({ where: { id } });
  if (!book) {
    throw new BookNotFoundError();
  }
  if (book.user_id !== req.user.id) {
    throw new NotBookOwnerError();
  }
  if (book.status !== 'pending') {
    throw new BookNotEditableError();
  }

  let updated;
  try {
    const [, result] = await req.server.prisma.$transaction([
      req.server.prisma.theme_book.deleteMany({ where: { book_id: id } }),
      req.server.prisma.book.update({
        where: { id },
        data: {
          title: input.title,
          author: input.author,
          publishing_house: input.publishing_house,
          short_description: input.short_description,
          publication_year: input.publication_year,
          resume: input.resume,
          reference_link: input.reference_link,
          type_id: input.type_id,
          themes: {
            create: input.theme_ids.map((theme_id) => ({ theme: { connect: { id: theme_id } } })),
          },
        },
        include: {
          type: true,
          themes: { include: { theme: true } },
        },
      }),
    ]);
    updated = result;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') throw new BookAlreadyExistsError();
      if (e.code === 'P2003' || e.code === 'P2025') throw new InvalidBookReferenceError();
    }
    req.log.error(e);
    throw new BookCreateError();
  }

  const result = {
    id: updated.id,
    title: updated.title,
    author: updated.author,
    short_description: updated.short_description,
    publishing_house: updated.publishing_house,
    publication_year: updated.publication_year,
    resume: updated.resume,
    reference_link: updated.reference_link,
    created_at: updated.created_at,
    type: updated.type,
    themes: updated.themes.map((t: { theme: { id: number; theme_name: string } }) => t.theme),
  };
  return reply.code(200).send(result);
}

export async function deleteBookHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = req.params as z.infer<typeof getBookParamsSchema>;

  const book = await req.server.prisma.book.findUnique({ where: { id } });
  if (!book) {
    throw new BookNotFoundError();
  }
  if (book.user_id !== req.user.id) {
    throw new NotBookOwnerError();
  }
  if (book.status !== 'pending') {
    throw new BookNotEditableError();
  }

  await req.server.prisma.$transaction([
    req.server.prisma.theme_book.deleteMany({ where: { book_id: id } }),
    req.server.prisma.book_validation.deleteMany({ where: { book_id: id } }),
    req.server.prisma.book.delete({ where: { id } }),
  ]);

  return reply.code(200).send({ message: 'Suggestion supprimée.' });
}
