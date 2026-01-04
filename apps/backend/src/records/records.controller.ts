import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordSchema, CreateRecordDto, UpdateRecordSchema, UpdateRecordDto, RecordFilterSchema, RecordFilterDto } from './dto/record.schema';
import { PageOptionsDto } from '../dto/page-options.dto';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Public, Admin } from '../auth/decorators/access.decorator';

@ApiTags('records')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Admin()
  @Post()
  @UsePipes(new ZodValidationPipe(CreateRecordSchema))
  create(@Body() createRecordDto: CreateRecordDto) {
    return this.recordsService.create(createRecordDto);
  }

  @Public()
  @Get()
  findAll(
    @Query(new ZodValidationPipe(RecordFilterSchema)) filter: RecordFilterDto,
  ) {
    const pageOptions = new PageOptionsDto();
    pageOptions.page = filter.page;
    pageOptions.limit = filter.limit;
    pageOptions.sort = filter.sort;
    return this.recordsService.findAll(pageOptions, filter);
  }

  @Public()
  @Get('search')
  search(@Query(new ZodValidationPipe(RecordFilterSchema)) filter: RecordFilterDto) {
    const pageOptions = new PageOptionsDto();
    pageOptions.page = filter.page;
    pageOptions.limit = filter.limit;
    return this.recordsService.search(filter.q, pageOptions);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recordsService.findOne(+id);
  }

  @Admin()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateRecordSchema)) updateRecordDto: UpdateRecordDto,
  ) {
    return this.recordsService.update(+id, updateRecordDto);
  }

  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recordsService.remove(+id);
  }
}