import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RecordFilterDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional()
  artistId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional()
  genreId?: number;
}
