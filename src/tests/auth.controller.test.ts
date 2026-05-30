import { expect, expectTypeOf, test } from 'vitest'
import { createUserSchema } from '../modules/auth/auth.schema'
import { signUp } from '../modules/auth/auth.controller'
import 'dotenv/config'

 // TODO: Vérification des messages d'erreur et de succès!
 // TODO: que doit-on vérifier dans ces tests?
 // TODO: respecter la convention describe/it


// Vérification des types TypeScript
test('my types work properly', () => {
    expectTypeOf(signUp).toBeFunction()
    expectTypeOf({email: "ada@gmail.com"}).toEqualTypeOf<{email: string}>()
    expectTypeOf({username: "Ada"}).toEqualTypeOf<{username: string}>()
    expectTypeOf({password: "testpwd"}).toEqualTypeOf<{password: string}>()
  })

  
test('email valide', () => {
    const result = createUserSchema.safeParse({
        email: "ada@gmail.com",
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