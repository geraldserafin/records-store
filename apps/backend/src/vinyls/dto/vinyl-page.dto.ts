import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PageOptionsDto, SortDirection } from 'src/dto/page-options.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class FilterVinylDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  authorName?: string;
}

class SortVinylDto {
  @IsEnum(SortDirection)
  @IsOptional()
  price?: SortDirection;

  @IsEnum(SortDirection)
  @IsOptional()
  name?: SortDirection;

  @IsEnum(SortDirection)
  @IsOptional()
  authorName?: SortDirection;
}

export class VinylPageDto implements PageOptionsDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @ApiProperty()
  limit: number = 10;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @ApiProperty()
  page: number = 1;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterVinylDto)
  @ApiProperty()
  filter?: FilterVinylDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => SortVinylDto)
  @ApiProperty()
  sort?: SortVinylDto;
}
