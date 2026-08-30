import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Prisma } from '../../generated/prisma/client.js';
import type { ValidateBookParams, ValidateBookInput } from './admin.schema.js';
import { BookNotFoundError } from '../book/book.error.js';

type PendingBookWithRelations = Prisma.bookGetPayload<{
  include: {
    type: true;
    themes: { include: { theme: true } };
    user: { select: { id: true; username: true; email: true } };
  };
}>;

export async function getPendingBooksHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const books = await req.server.prisma.book.findMany({
    where: { status: 'pending' },
    orderBy: { created_at: 'asc' },
    include: {
      type: true,
      themes: { include: { theme: true } },
      user: { select: { id: true, username: true, email: true } },
    },
  });

  const formatted = books.map((book: PendingBookWithRelations) => ({
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
    user: book.user,
  }));

  return reply.code(200).send(formatted);
}

export async function validateBookHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = req.params as ValidateBookParams;
  const { status, comment } = req.body as ValidateBookInput;

  const book = await req.server.prisma.book.findUnique({ where: { id } });
  if (!book) {
    throw new BookNotFoundError();
  }

  // Décision + mise à jour du livre dans une même transaction : soit les
  // deux écritures passent, soit aucune (pas de book_validation orpheline
  // sans le status du livre qui suit, ou l'inverse).
  const [, updatedBook] = await req.server.prisma.$transaction([
    req.server.prisma.book_validation.create({
      data: {
        book_id: id,
        admin_id: req.user.id,
        status,
        comment,
      },
    }),
    req.server.prisma.book.update({
      where: { id },
      data: { status },
      include: {
        type: true,
        themes: { include: { theme: true } },
      },
    }),
  ]);

  const result = {
    id: updatedBook.id,
    title: updatedBook.title,
    author: updatedBook.author,
    short_description: updatedBook.short_description,
    publishing_house: updatedBook.publishing_house,
    publication_year: updatedBook.publication_year,
    resume: updatedBook.resume,
    reference_link: updatedBook.reference_link,
    created_at: updatedBook.created_at,
    type: updatedBook.type,
    themes: updatedBook.themes.map((t: { theme: { id: number; theme_name: string } }) => t.theme),
  };

  return reply.code(200).send(result);
}
