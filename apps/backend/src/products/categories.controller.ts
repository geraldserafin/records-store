import { Body, Controller, Get, Param, ParseIntPipe, Post, Patch, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Admin, Public } from 'src/auth/decorators/access.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Admin()
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  create(
    @Body('name') name: string,
    @Body('parentId') parentId?: number,
  ) {
    return this.categoriesService.create(name, parentId);
  }

  @Admin()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body('name') name?: string,
    @Body('parentId') parentId?: number,
  ) {
    return this.categoriesService.update(id, { name, parentId });
  }

  @Admin()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}