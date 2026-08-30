import { expect, expectTypeOf, describe, it, vi, beforeEach } from 'vitest';
import { getBooksByStatusHandler, validateBookHandler } from './admin.controller';
import { adminBookSchema, validateBookResponseSchema } from './admin.schema';
import { BookNotFoundError } from '../book/book.error';

describe('admin types', () => {
  it('getBooksByStatusHandler is a function', () => {
    expectTypeOf(getBooksByStatusHandler).toBeFunction()
  })
  it('validateBookHandler is a function', () => {
    expectTypeOf(validateBookHandler).toBeFunction()
  })
})

describe('getBooksByStatusHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockPendingBooks = [
    {
      id: 9,
      title: 'Une Chambre à Soi',
      author: 'Virginia Woolf',
      short_description: 'desc',
      reference_link: null,
      created_at: new Date(),
      type: { id: 1, type_name: 'Roman', url_image: null },
      themes: [{ theme: { id: 2, theme_name: 'Féminisme' } }],
      publishing_house: '10/18',
      publication_year: '1929',
      resume: null,
      user: { id: 'user-uuid', username: 'Alice', email: 'alice@prisma.io' },
    },
  ]

  const mockFindMany = vi.fn().mockResolvedValue(mockPendingBooks)

  const mockReq = {
    query: { status: 'pending' },
    server: {
      prisma: {
        book: {
          findMany: mockFindMany,
        },
      },
    },
  } as any

  const mockReply = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as any

  it('returns 200 with formatted books including the submitter', async () => {
    await getBooksByStatusHandler(mockReq, mockReply)

    expect(mockReply.code).toHaveBeenCalledWith(200)
    expect(mockReply.send).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 9,
        themes: [{ id: 2, theme_name: 'Féminisme' }],
        user: { id: 'user-uuid', username: 'Alice', email: 'alice@prisma.io' },
      }),
    ])
  })

  it('queries books filtered by the requested status, ordered by created_at asc', async () => {
    await getBooksByStatusHandler(mockReq, mockReply)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'pending' },
        orderBy: { created_at: 'asc' },
      })
    )
  })

  it('validates against adminBookSchema', async () => {
    await getBooksByStatusHandler(mockReq, mockReply)
    const sentPayload = mockReply.send.mock.calls[0]![0]
    const result = adminBookSchema.safeParse(sentPayload[0])
    expect(result.success).toBe(true)
  })
})

describe('validateBookHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockBook = { id: 9, status: 'pending' }

  const mockUpdatedBook = {
    id: 9,
    title: 'Une Chambre à Soi',
    author: 'Virginia Woolf',
    short_description: 'desc',
    reference_link: null,
    created_at: new Date(),
    type: { id: 1, type_name: 'Roman', url_image: null },
    themes: [{ theme: { id: 2, theme_name: 'Féminisme' } }],
    publishing_house: '10/18',
    publication_year: '1929',
    resume: null,
  }

  const mockFindUnique = vi.fn().mockResolvedValue(mockBook)
  const mockCreate = vi.fn()
  const mockUpdate = vi.fn()
  const mockTransaction = vi.fn().mockResolvedValue([{}, mockUpdatedBook])

  const mockReq = {
    params: { id: 9 },
    body: { status: 'validated', comment: null },
    user: { id: 'admin-uuid' },
    server: {
      prisma: {
        book: { findUnique: mockFindUnique, update: mockUpdate },
        book_validation: { create: mockCreate },
        $transaction: mockTransaction,
      },
    },
  } as any

  const mockReply = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as any

  it('returns 200 with the updated book', async () => {
    await validateBookHandler(mockReq, mockReply)

    expect(mockReply.code).toHaveBeenCalledWith(200)
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 9,
        themes: [{ id: 2, theme_name: 'Féminisme' }],
      })
    )
  })

  it('validates against validateBookResponseSchema', async () => {
    await validateBookHandler(mockReq, mockReply)
    const sentPayload = mockReply.send.mock.calls[0]![0]
    const result = validateBookResponseSchema.safeParse(sentPayload)
    expect(result.success).toBe(true)
  })

  it('throws BookNotFoundError when the book does not exist, without opening a transaction', async () => {
    mockFindUnique.mockResolvedValueOnce(null)

    await expect(validateBookHandler(mockReq, mockReply)).rejects.toThrow(BookNotFoundError)
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('attributes the decision to req.user.id (never a client-supplied admin_id) and updates book.status', async () => {
    await validateBookHandler(mockReq, mockReply)

    expect(mockCreate).toHaveBeenCalledWith({
      data: { book_id: 9, admin_id: 'admin-uuid', status: 'validated', comment: null },
    })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 9 },
        data: { status: 'validated' },
      })
    )
    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })
})
