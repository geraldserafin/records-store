import { IsObject, IsOptional, ValidateNested } from 'class-validator';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export abstract class PageOptionsDto {
  page: number = 1;
  limit: number = 10;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  filter?: Partial<{ [k: string]: any }>;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  sort?: Partial<{ [k: string]: any }>;
}
