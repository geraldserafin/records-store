import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Delete, Patch } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { Admin, Public } from 'src/auth/decorators/access.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all products with EAV attributes' })
  findAll(@Query() pageOptions: PageOptionsDto) {
    return this.productsService.findAll(pageOptions);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single product with EAV attributes' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Admin()
  @Post()
  @ApiOperation({ summary: 'Create a new product with EAV attributes' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Admin()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Admin()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
