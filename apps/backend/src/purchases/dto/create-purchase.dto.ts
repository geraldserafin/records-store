import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';

export class CartItemDto {
  @IsInt()
  @IsPositive()
  @ApiProperty()
  quantity: number;

  @IsInt()
  @IsPositive()
  @ApiProperty()
  productId: number;
}

export class CreatePurchaseDto {
  @IsArray()
  @ValidateNested()
  @Type(() => CartItemDto)
  @ApiProperty({ type: () => CartItemDto })
  items: CartItemDto[];
}
