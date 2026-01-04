import { z } from 'zod';

export const CartItemSchema = z.object({
  quantity: z.coerce.number().int().positive(),
  recordId: z.coerce.number().int().positive(),
});

export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema),
  guestEmail: z.string().email().optional(),
  shippingName: z.string().min(1),
  shippingAddress: z.string().min(1),
  shippingCity: z.string().min(1),
  shippingPostalCode: z.string().min(1),
  shippingCountry: z.string().min(1),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
