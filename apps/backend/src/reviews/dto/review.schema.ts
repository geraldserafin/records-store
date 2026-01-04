import { z } from 'zod';

export const CreateReviewSchema = z.object({
  recordId: z.coerce.number().int().positive(),
  score: z.coerce.number().int().min(1).max(10),
  description: z.string().optional(),
});

export const ReviewPageSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  recordId: z.coerce.number().int().positive().optional(),
  userId: z.coerce.number().int().positive().optional(),
});

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;
export type ReviewPageDto = z.infer<typeof ReviewPageSchema>;
