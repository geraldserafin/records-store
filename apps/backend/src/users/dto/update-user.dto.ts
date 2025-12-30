import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  @ApiProperty()
  firstName?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  @ApiProperty()
  lastName?: string;

  @IsUrl()
  @MaxLength(255)
  @IsOptional()
  @ApiProperty()
  photoUrl?: string;

  @IsDate()
  @IsOptional()
  @ApiProperty()
  birthDate?: Date;
}
