import { PartialType } from '@nestjs/mapped-types';
import { CreateRecordDto } from './create-record.dto';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRecordDto extends PartialType(CreateRecordDto) {
  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiProperty()
  stock?: number;
}