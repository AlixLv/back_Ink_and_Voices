import { defineConfig } from 'vitest/config'


export default defineConfig(() => {

  return { 
    test: {
      env: {
        LOCAL_DATABASE_URL: process.env.LOCAL_DATABASE_URL
      },
      environment: 'node',
      globals: true, // pour utiliser les fonctions expect, describe, etc. sans les importer
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    }
  }
})

