import { SelectQueryBuilder } from 'typeorm';
import { PageOptionsDto } from './dto/page-options.dto';
import { ApiProperty } from '@nestjs/swagger';

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
  pageOptions: PageOptionsDto,
  relationMappings: { [k: string]: string } = {},
) {
  const { alias } = queryBuilder;

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

  if (pageOptions.sort) {
    Object.entries(pageOptions.sort).forEach(([field, dir], index) => {
      const direction = (dir as string).toUpperCase() as 'ASC' | 'DESC';
      const path = relationMappings[field] || `${alias}.${field}`;

      if (index === 0) {
        queryBuilder.orderBy(path, direction);
        return;
      }

      queryBuilder.addOrderBy(path, direction);
    });
  }

  const skip = (pageOptions.page - 1) * pageOptions.limit;
  const take = pageOptions.limit;

  queryBuilder.skip(skip).take(take);

  const [items, total] = await queryBuilder.getManyAndCount();

  return {
    items,
    meta: {
      page: pageOptions.page,
      limit: pageOptions.limit,
      total,
      totalPages: Math.ceil(total / pageOptions.limit),
    },
  } as Page<T>;
}
