import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'Massive Attack' })
  name: string;
}
