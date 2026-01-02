import { IsInt, IsObject, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductFilterDto } from '../products/dto/product-filter.dto';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class PageOptionsDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false, default: 1 })
  page: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false, default: 10 })
  limit: number = 10;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductFilterDto)
  filter?: ProductFilterDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  sort?: Partial<{ [k: string]: any }>;
}
