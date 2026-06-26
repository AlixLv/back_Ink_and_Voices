import { expect, it, describe } from 'vitest';
import { createUserSchema } from '../auth.schema'
import 'dotenv/config'

const dbUrl = process.env.TEST_DATABASE;
console.log("Database utilisée: ", dbUrl)

describe('cannot login with an invalid email', () => {
    it('returns False', () => { // quelle status d'erreur? voir avec postman
        const result = createUserSchema.safeParse({ 
            email: "not-a-email",
            username: "Ada",
            password: "testpassword123"
        })
    expect(result.success).toBe(false);
    });
});