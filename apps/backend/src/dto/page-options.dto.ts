import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  sort?: any;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  @IsOptional()
  filter?: any;
}