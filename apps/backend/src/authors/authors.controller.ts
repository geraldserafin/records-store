import { Controller, Post, Body } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Admin } from 'src/auth/decorators/access.decorator';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Admin()
  @Post()
  @ApiOperation({ summary: 'Create a new author' })
  @ApiOkResponse({
    description: 'Author created succesfully',
    type: () => CreateAuthorDto,
  })
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }
}
