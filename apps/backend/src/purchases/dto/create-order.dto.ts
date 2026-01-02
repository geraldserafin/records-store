import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

export class CartItemDto {
  @IsInt()
  @IsPositive()
  @ApiProperty()
  @Type(() => Number)
  quantity: number;

  @IsInt()
  @IsPositive()
  @ApiProperty()
  @Type(() => Number)
  productId: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested()
  @Type(() => CartItemDto)
  @ApiProperty({ type: () => CartItemDto })
  items: CartItemDto[];

  @IsEmail()
  @IsOptional()
  @ApiProperty()
  guestEmail?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  shippingName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  shippingAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  shippingCity: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  shippingPostalCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  shippingCountry: string;
}