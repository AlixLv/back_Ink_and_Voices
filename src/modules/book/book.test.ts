import { expect, expectTypeOf, describe, it, vi, beforeEach, beforeAll } from 'vitest';
import { bookSchema, getBooksResponseSchema, bookDetailSchema } from './book.schema';
import { getRecentBooksHandler, getBookHandler } from './book.controller';
import { BookFetchError } from './book.error';
import 'dotenv/config';
import { mock } from 'node:test'

describe('book schema', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validBook = {
    id: 1,
    title: 'Les La Licorne Noire',
    author: 'Audre Lorde',
    short_description: ' Sur fond de mélancolie, toujours empreinte de peur et de fureur, sa parole s’élève, furieuse, impatiente, multiple, créatrice et inspirante.',
    reference_link: null,
    created_at: new Date(),
    type: {
      id: 1,
      type_name: 'Poésie',
      url_image: null,
    },
    themes: [
      { id: 1, theme_name: 'Racisme' },
      { id: 2, theme_name: 'Féminisme' },
    ],
  }

  it('validates a correct book object', () => {
    const result = bookSchema.safeParse(validBook)
    expect(result.success).toBe(true)
  })

  it('fails when title is missing', () => {
    const result = bookSchema.safeParse({ ...validBook, title: undefined })
    expect(result.success).toBe(false)
  })

  it('fails when author is missing', () => {
    const result = bookSchema.safeParse({ ...validBook, author: undefined })
    expect(result.success).toBe(false)
  })

  it('accepts null for reference_link', () => {
    const result = bookSchema.safeParse({ ...validBook, reference_link: null })
    expect(result.success).toBe(true)
  })

  it('accepts null for type url_image', () => {
    const result = bookSchema.safeParse({
      ...validBook,
      type: { ...validBook.type, url_image: null },
    })
    expect(result.success).toBe(true)
  })

  it('validates an array of books', () => {
    const result = getBooksResponseSchema.safeParse([validBook, validBook])
    expect(result.success).toBe(true)
  })

  it('validates an empty array', () => {
    const result = getBooksResponseSchema.safeParse([])
    expect(result.success).toBe(true)
  })
})


describe('book types', () => {
  it('getRecentBooksHandler is a function', () => {
    expectTypeOf(getRecentBooksHandler).toBeFunction()
  })
})


describe('getRecentBooksHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockBooks = [
    {
      id: 1,
      title: 'La Licorne Noire',
      author: 'Audre Lorde',
      short_description: ' Sur fond de mélancolie, toujours empreinte de peur et de fureur, sa parole s’élève, furieuse, impatiente, multiple, créatrice et inspirante.',
      reference_link: null,
      created_at: new Date(),
      type: { id: 1, type_name: 'Poésie', url_image: null },
      themes: [{ theme: { id: 1, theme_name: 'Féminisme' } }],
    },
  ]

  const mockFindMany = vi.fn().mockResolvedValue(mockBooks)

  const mockReq = {
    server: {
      prisma: {
        book: {
          findMany: mockFindMany,
        },
      },
    },
    log: { error: vi.fn() },
  } as any

  const mockReply = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as any

  it('returns 200 with formatted books', async () => {
    await getRecentBooksHandler(mockReq, mockReply)

    expect(mockReply.code).toHaveBeenCalledWith(200)
    expect(mockReply.send).toHaveBeenCalledWith([
      {
        ...mockBooks[0],
        themes: [{ id: 1, theme_name: 'Féminisme' }],
      },
    ])
  })

  it('throws BookFetchError when Prisma rejects', async () => {
    mockFindMany.mockRejectedValueOnce(new Error('DB connection lost'))

    await expect(getRecentBooksHandler(mockReq, mockReply)).rejects.toThrow(BookFetchError)
  })

  it('queries only validated books ordered by created_at desc', async () => {
    await getRecentBooksHandler(mockReq, mockReply)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'validated' },
        orderBy: { created_at: 'desc' },
      })
    )
  })
})

 

describe('getBookHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // forme brute du book retournée par Prisma, avec la join-table theme_book
  const mockBook = {
      id: 1,
      title: 'La Licorne Noire',
      author: 'Audre Lorde',
      short_description: ' Sur fond de mélancolie, toujours empreinte de peur et de fureur, sa parole s’élève, furieuse, impatiente, multiple, créatrice et inspirante.',
      reference_link: null,
      created_at: new Date(),
      type: { id: 1, type_name: 'Poésie', url_image: null },
      themes: [
      {theme: { id: 1, theme_name: 'Racisme' }},
      {theme: { id: 2, theme_name: 'Féminisme' }},
      ],
      publishing_house: 'L\'Arche',
      publication_year: '2021',
      resume:'Le recueil La Licorne noire de la poétesse et militante Audre Lorde occupe au sein de ses écrits poétiques une place fondamentale. Ces poèmes d’amour évoquent l’apogée d’une sensualité et l’épanouissement d’une sexualité affranchie des normes sociales, prenant sa prodigieuse vigueur dans les luttes contre toutes les formes de discriminations.'
    }

  const mockFindUnique = vi.fn().mockResolvedValue(mockBook)

  const mockReq = {
    params: { id: 1 },
    server: {
      prisma: {
        book: {
          findUnique: mockFindUnique,
        },
      },
    },
    log: {error: vi.fn()},
  } as any

  const mockReply = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as any

  it('should return 200 with formatted book', async () => {
    await getBookHandler(mockReq, mockReply)

    expect(mockReply.code).toHaveBeenCalledWith(200)
    // book formatté par getBookHandler pour themes
    expect(mockReply.send).toHaveBeenCalledWith(
      {
        id: mockBook.id,
        title: mockBook.title,
        author: mockBook.author,
        short_description: mockBook.short_description,
        reference_link: mockBook.reference_link,
        created_at: mockBook.created_at,
        type: mockBook.type,
        themes: [
          { id: 1, theme_name: 'Racisme' },
          { id: 2, theme_name: 'Féminisme' },
        ],
        publishing_house: mockBook.publishing_house,
        publication_year: mockBook.publication_year,
        resume: mockBook.resume
      });      
  });

  it('validates a correct detailed book object', async() => {
    await getBookHandler(mockReq, mockReply)
    const sentPayload = mockReply.send.mock.calls[0][0]
    const result = bookDetailSchema.safeParse(sentPayload)
    expect(result.success).toBe(true)
  })

  it('propagates the raw error when Prisma throws', async () => {
    mockFindUnique.mockRejectedValueOnce(new Error('DB error'))

    await expect(getBookHandler(mockReq, mockReply)).rejects.toThrow('DB error')
  })

  it('throws BookNotFoundError message when book does not exist', async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    await expect(getBookHandler(mockReq, mockReply)).rejects.toThrow('Aucun livre trouvé.');

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: mockReq.params.id },
      include: { type: true, themes: { include: { theme: true } } },
    });
  });

  it('returns 200 with all themes mapped when book has multiple themes', async () => {
    mockFindUnique.mockResolvedValueOnce({
      ...mockBook,
      themes: [
        { theme: { id: 1, theme_name: 'Féminisme' } },
        { theme: { id: 2, theme_name: 'Résistance' } },
      ],
    });

    await getBookHandler(mockReq, mockReply);

    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        themes: [
          { id: 1, theme_name: 'Féminisme' },
          { id: 2, theme_name: 'Résistance' },
        ],
      })
    );
  });
});
