import { expect, it, describe, vi, beforeEach } from 'vitest';
import * as argon2 from 'argon2';
import { signUp, loginUserHandler } from '../auth.controller';
import { createUserSchema } from '../auth.schema';
import { UserAlreadyExistsError, InvalidCredentialsError } from '../auth.errors';
import 'dotenv/config'

const dbUrl = process.env.TEST_DATABASE;
console.log("Database utilisée: ", dbUrl)


vi.mock('argon2', () => ({
    hash: vi.fn(),
    verify: vi.fn(),
}));

describe('signUp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockFindUnique = vi.fn();
    const mockCreate = vi.fn();

    // simulation de l'objet req que Fastify passerait normalement ) signUp.
    const mockReq = {
        body: {
            email: 'guillemette@gmail.com',
            username: 'Guillemette',
            password: 'testpassword123',
        },
        server: {
            prisma: {
                user: {
                    findUnique: mockFindUnique,
                    create: mockCreate,
                },
            },
        },
    } as any;

    const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
    } as any;

    it('throws UserAlreadyExistsError and does not create a user', async () => {
        // on simule le fait que Prisma a trouvé un user et retourne cet objet user.
        mockFindUnique.mockResolvedValueOnce({
            id: 'fake-uuid',
            email: 'guillemette@gmail.com',
            username: 'Guillemette',
            password: 'hashed-password',
            role: 'user',
            created_at: new Date(),
            updated_at: new Date(),
        });

        // on passe la Promise à expect(), Vitest attend que la Promise se termine et qu'elle soit rejetée
        // toThrow vérifie que l'erreur de rejet est bien l'instance de notre classe.
        await expect(signUp(mockReq, mockReply)).rejects.toThrow(UserAlreadyExistsError);
        // on vérifie que notre prisma.user.create() n'est pas exécuté.
        expect(mockCreate).not.toHaveBeenCalled();
    });
});

describe('loginUserHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockFindUnique = vi.fn();
    const mockJwtSign = vi.fn();

    // on simule la forme dont loginUserHandler a besoin.
    const mockReq = {
        body: {
            email: 'guillemette@gmail.com',
            password: 'wrong-password',
        },
        server: {
            prisma: {
                user: {
                    findUnique: mockFindUnique,
                },
            },
            // clé jwt.sign même si dans ce cas précis, ne doit pas être appelé
            jwt: {
                sign: mockJwtSign,
            },
        },
    } as any;

    const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        setCookie: vi.fn().mockReturnThis(),
    } as any;

    it('throws InvalidCredentialsError and does not set a cookie', async () => {
        mockFindUnique.mockResolvedValueOnce({
            id: 'fake-uuid',
            email: 'guillemette@gmail.com',
            username: 'Guillemette',
            password: 'hashed-password',
            role: 'user',
            created_at: new Date(),
            updated_at: new Date(),
        });

        // on simule le mauvais mdp en forçant le retour à false.
        vi.mocked(argon2.verify).mockResolvedValueOnce(false);

        await expect(loginUserHandler(mockReq, mockReply)).rejects.toThrow(InvalidCredentialsError);
       // on vérifie qu'aucune trace d'authentification n'est émise: ni cookie ni appel à jwt.sign
        expect(mockReply.setCookie).not.toHaveBeenCalled();
        expect(mockJwtSign).not.toHaveBeenCalled();
    });

 
    it('cannot login with an invalid email', () => { 
        const result = createUserSchema.safeParse({ 
            email: "not-a-email",
            username: "Ada",
            password: "testpassword123"
        })
    expect(result.success).toBe(false);
    });
});
