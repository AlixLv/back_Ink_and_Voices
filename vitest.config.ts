import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // options de configuration de vitest
    environment: 'node',
    env: {
      NODE_ENV: 'test'
    },
    globals: true, // pour utiliser les fonctions expect, describe, etc. sans les importer
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})