import { IsNumber, IsOptional, IsString, IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecordDto {
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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty()
  images?: string[];

  @IsInt()
  @ApiProperty()
  mainArtistId: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiProperty()
  coArtistIds?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiProperty()
  genreIds?: number[];
}