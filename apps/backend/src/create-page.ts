import { SelectQueryBuilder } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export interface PageOptions {
  page?: number;
  limit?: number;
  sort?: any;
  filter?: any;
}

export class Page<T> {
  @ApiProperty()
  items: T[];

  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function createPage<T>(
  queryBuilder: SelectQueryBuilder<T>,
  pageOptions: PageOptions,
  relationMappings: { [k: string]: string } = {},
) {
  const { alias } = queryBuilder;
  const page = pageOptions.page ?? 1;
  const limit = pageOptions.limit ?? 10;

  if (pageOptions.filter) {
    Object.entries(pageOptions.filter).forEach(([field, value]) => {
      // Explicitly skip relationship IDs that cause SQL errors if handled by service
      if (['artistId', 'genreId', 'categoryId'].includes(field)) return;
      if (value === undefined || value === null) return;

      const path = relationMappings[field] || `${alias}.${field}`;

      queryBuilder.andWhere(`${path} LIKE :name`, {
        name: `%${value}%`,
      });
    });
  }

  if (pageOptions.sort && typeof pageOptions.sort === 'object') {
    Object.entries(pageOptions.sort).forEach(([field, dir]) => {
      const direction = (dir as string).toUpperCase() as 'ASC' | 'DESC';
      const path = relationMappings[field] || `${alias}.${field}`;

      queryBuilder.addOrderBy(path, direction);
    });
  }

  const skip = (page - 1) * limit;
  const take = limit;

  queryBuilder.skip(skip).take(take);

  const [items, total] = await queryBuilder.getManyAndCount();

  return {
    items,
    meta: {
      page: page,
      limit: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  } as Page<T>;
}
