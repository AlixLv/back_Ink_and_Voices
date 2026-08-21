import { z } from 'zod';

export const themeSchema = z.object({
  id: z.number(),
  theme_name: z.string(),
});

export const getThemesResponseSchema = z.array(themeSchema);

export const createThemeSchema = z.object({
  theme_name: z.string().trim().min(1).max(100),
});

export type CreateThemeInput = z.infer<typeof createThemeSchema>;
