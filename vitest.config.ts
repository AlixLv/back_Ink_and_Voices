import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env) // charge réellement .env dans process.env

  return { 
    test: {
      env: {
        LOCAL_DATABASE_URL: process.env.LOCAL_DATABASE_URL
      },
      environment: 'node',
      globals: true,
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    }
  }
})