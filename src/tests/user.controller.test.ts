import { expect, expectTypeOf, test } from 'vitest'
import { safeParse, z } from 'zod' 
import { createUserSchema } from '../modules/user/user.schema'
import { signUp } from '../modules/user/user.controller'
import 'dotenv/config'


  // Vérification d'égalité pour les objets
test('email containing ada@gmail.com equals to ada@gmail.com', () => {
    expect({email: 'ada@gmail.com'}).toEqual({email: 'ada@gmail.com'})
})

test('username containing Ada equals to Ada', () => {
    expect({username: 'Ada'}).toEqual({username: 'Ada'})
})

  // Vérification des types TypeScript
test('my types work properly', () => {
    expectTypeOf(signUp).toBeFunction()
    expectTypeOf({email: "ada@gmail.com"}).toEqualTypeOf<{email: string}>()
    expectTypeOf({username: "Ada"}).toEqualTypeOf<{username: string}>()
    expectTypeOf({password: "testpwd"}).toEqualTypeOf<{password: string}>()
  })
  
 // TODO: Vérification des messages d'erreur et de succès!

test('email valide', () => {
    const result = createUserSchema.safeParse(
        {email: "ada@gmail.com",
        username: "Ada",
        password: "testpassword123"
    })
    console.log("result.error: ", result.error?.flatten())
    expect(result.success).toBe(true)
})


test('email invalide', () => {
    const result = createUserSchema.safeParse({
        email: "not-an-email",
        username: "Ada",
        password: "testpassword123"
    })
    expect(result.success).toBe(false)
})