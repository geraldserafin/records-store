import { ApiProperty } from '@nestjs/swagger';
import {
  IsPositive,
  IsString,
  MinLength,
  IsDecimal,
  IsInt,
} from 'class-validator';

export class CreateVinylDto {
  @IsDecimal({ decimal_digits: '2' })
  @ApiProperty()
  price: number;

  @IsString()
  @MinLength(1)
  @ApiProperty()
  name: string;

  @IsPositive()
  @IsInt()
  @ApiProperty()
  authorId: number;

  @IsString()
  @MinLength(1)
  @ApiProperty()
  description: string;
}
