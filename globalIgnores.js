import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["src/generated", "dist"]),
  // ... reste de la config
]);