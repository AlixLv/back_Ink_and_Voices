import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  test: {
    // options de configuration de vitest
    environment: 'node',
    globals: true, // pour utiliser les fonctions expect, describe, etc. sans les importer
    //include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // pour inclure les fichiers de test dans le dossier srcet pas dans build afin de ne pas lancer les tests compilés.
  },
})