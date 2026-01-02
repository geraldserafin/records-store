import { Body, Controller, Get, Param, ParseIntPipe, Post, Patch, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Admin, Public } from 'src/auth/decorators/access.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AttributeType, AttributeSection } from './entities/category-attribute.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all categories with their schemas' })
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

  @Admin()
  @Post(':id/attributes')
  @ApiOperation({ summary: 'Add an attribute to a category schema' })
  addAttribute(
    @Param('id', ParseIntPipe) id: number,
    @Body('name') name: string,
    @Body('type') type: AttributeType,
    @Body('displaySection') displaySection: AttributeSection,
    @Body('options') options?: string[],
  ) {
    return this.categoriesService.addAttribute(id, name, type, displaySection, options);
  }

  @Admin()
  @Patch('attributes/:attrId')
  @ApiOperation({ summary: 'Update an attribute' })
  updateAttribute(
    @Param('attrId', ParseIntPipe) attrId: number,
    @Body('name') name?: string,
    @Body('type') type?: AttributeType,
    @Body('displaySection') displaySection?: AttributeSection,
    @Body('options') options?: string[],
  ) {
    return this.categoriesService.updateAttribute(attrId, { name, type, displaySection, options });
  }

  @Admin()
  @Delete('attributes/:attrId')
  @ApiOperation({ summary: 'Delete an attribute' })
  removeAttribute(@Param('attrId', ParseIntPipe) attrId: number) {
    return this.categoriesService.removeAttribute(attrId);
  }

  @Admin()
  @Get('attributes/:attrId/values')
  @ApiOperation({ summary: 'Get unique values for an attribute' })
  getUniqueValues(@Param('attrId', ParseIntPipe) attrId: number) {
    return this.categoriesService.getUniqueAttributeValues(attrId);
  }

  @Admin()
  @Patch('attributes/:attrId/values')
  @ApiOperation({ summary: 'Bulk update attribute values' })
  updateValues(
    @Param('attrId', ParseIntPipe) attrId: number,
    @Body('oldValue') oldValue: string,
    @Body('newValue') newValue: string,
  ) {
    return this.categoriesService.updateAttributeValues(attrId, oldValue, newValue);
  }
}
