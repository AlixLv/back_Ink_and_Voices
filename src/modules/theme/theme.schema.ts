import { z } from 'zod';

export const themeSchema = z.object({
  id: z.number(),
  theme_name: z.string(),
});

export const getThemesResponseSchema = z.array(themeSchema);
