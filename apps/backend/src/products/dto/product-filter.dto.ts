import { IsNumber, IsOptional, IsString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductFilterDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional()
  categoryId?: number;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  attributes?: Record<string, any>;
}
