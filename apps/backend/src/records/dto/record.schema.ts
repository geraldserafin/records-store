import { z } from 'zod';

export const CreateRecordSchema = z.object({
  name: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0).default(0),
  images: z.array(z.string()).optional(),
  mainArtistId: z.coerce.number().int().positive(),
  coArtistIds: z.array(z.coerce.number().int().positive()).optional().default([]),
  genreIds: z.array(z.coerce.number().int().positive()).optional().default([]),
});

export const UpdateRecordSchema = CreateRecordSchema.partial().extend({
  stock: z.coerce.number().int().min(0).optional(),
});

export const RecordFilterSchema = z.object({
  q: z.string().optional(),
  name: z.string().optional(),
  artistId: z.coerce.number().int().positive().optional(),
  genreId: z.coerce.number().int().positive().optional(),
  genreSlug: z.string().optional(),
  section: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: z.any().optional(),
});

export type CreateRecordDto = z.infer<typeof CreateRecordSchema>;
export type UpdateRecordDto = z.infer<typeof UpdateRecordSchema>;
export type RecordFilterDto = z.infer<typeof RecordFilterSchema>;