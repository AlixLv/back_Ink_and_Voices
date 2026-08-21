import { expect, it, describe } from 'vitest';
import { updateUserSchema } from '../user.schema';
import 'dotenv/config'

const dbUrl = process.env.TEST_DATABASE;
console.log("🍀 db utilisée: ", dbUrl)

// Tests unitaires
// test rejet d'un changement de pwd contenant moins de 8 caractères
describe('Test /api/users/update-profile with invalid pwd format', () => {
    it('should return an error when password is less than 8 caracters', () => {
        const res = updateUserSchema.safeParse({
            email:'testinvalidpwd@example.com',
            username: 'Chloe',
            password: 'tltr'
        })
        // Zod fgère automatiquement l'erreur via le validatorCompiler de Fastify et renvoie une erreur 400
        // il faut vérifier que saeParfe retourne bien success: false et que le champ concerne password
        expect(res.success).toBe(false);
        expect(res.error?.issues[0]?.path[0]).toBe('password');
    });

    it('should accept a password of exactly 8 caracters', () => {
        const res = updateUserSchema.safeParse({
            password:'12345678'
        })
        expect(res.success).toBe(true);
    });

    it('should accept an empty object since all fields are optional', () => {
        const res = updateUserSchema.safeParse({})
        expect(res.success).toBe(true);
    });
    
});

// test d'update avec un champ vide