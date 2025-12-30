import { IsInt, IsOptional, Min } from 'class-validator';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { Type } from 'class-transformer';

export class ReviewPageDto implements PageOptionsDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;
}
