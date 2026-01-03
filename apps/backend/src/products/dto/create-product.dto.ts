import { IsNumber, IsOptional, IsString, IsObject, IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  shortDescription?: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsNumber()
  @ApiProperty()
  price: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiProperty()
  stock?: number;

  @IsNumber()
  @ApiProperty()
  categoryId: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty()
  images?: string[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiProperty()
  artistIds?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiProperty()
  genreIds?: number[];
}
