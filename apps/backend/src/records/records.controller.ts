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
    return this.recordsService.findAll(filter, filter);
  }

  @Public()
  @Get('search')
  search(@Query(new ZodValidationPipe(RecordFilterSchema)) filter: RecordFilterDto) {
    return this.recordsService.search(filter.q, filter);
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