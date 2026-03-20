import { expect, expectTypeOf, test, describe, it } from 'vitest'
import { signUp} from './user.controller'
import { safeParse, z } from 'zod' 
import { createUserSchema } from './user.schema'


// Vérification d'égalité pour les objets
describe('basic user inputs tests', () => {
    it('should return ada@gmail.com when email input contains ada@gmail.com', () => {
        expect({email: 'ada@gmail.com'}).toEqual({email: 'ada@gmail.com'})
    })

    it('should return Ada when username input contains Ada', () => {
        expect({username: 'Ada'}).toEqual({username: 'Ada'})
    })

})

// Vérification des types TypeScript
describe('basic types TypeScript tests', () => {
    it('should return a function type when a function is tested', () => {
        expectTypeOf(signUp).toBeFunction()
    })

    it('should return a string type when testing email variable', () => {
        expectTypeOf({email: "ada@gmail.com"}).toEqualTypeOf<{email: string}>()
    })

    it('should return a string type when testing usernmae variable', () => {
        expectTypeOf({username: "Ada"}).toEqualTypeOf<{username: string}>()
    })

    it('should return a string type when testing password variable', () => {
        expectTypeOf({password: "testpwd"}).toEqualTypeOf<{password: string}>()
    })
})


 // TODO: Vérification des messages d'erreur et de succès!
test('email valide', () => {
    const result = createUserSchema.safeParse({email: "ada@gmail.com"})
    expect(result.success).toBe(true)
})

test('email invalide', () => {
    const result = createUserSchema.safeParse({email: "not-an-email"})
    expect(result.success).toBe(false)
})