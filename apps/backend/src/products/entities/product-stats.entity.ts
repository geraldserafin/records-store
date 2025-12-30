import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT 
      p.id as productId,
      COALESCE(AVG(r.score), 0) as averageRating
    FROM products p
    LEFT JOIN review r ON r.productId = p.id
    GROUP BY p.id
  `,
})
export class ProductStats {
  @ViewColumn()
  productId: number;

  @ViewColumn()
  averageRating: number;
}
