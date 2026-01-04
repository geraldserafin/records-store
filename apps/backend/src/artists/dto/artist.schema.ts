import { z } from 'zod';

export const CreateArtistSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  bio: z.string().optional(),
  image: z.string().optional(),
});

export const UpdateArtistSchema = CreateArtistSchema.partial();

export type CreateArtistDto = z.infer<typeof CreateArtistSchema>;
export type UpdateArtistDto = z.infer<typeof UpdateArtistSchema>;
