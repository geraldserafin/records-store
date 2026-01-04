import { z } from 'zod';

export const CreateGenreSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateGenreSchema = CreateGenreSchema.partial();

export type CreateGenreDto = z.infer<typeof CreateGenreSchema>;
export type UpdateGenreDto = z.infer<typeof UpdateGenreSchema>;
