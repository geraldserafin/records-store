import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Record,
    ]),
  ],
  providers: [RecordsService],
  controllers: [RecordsController],
  exports: [RecordsService],
})
export class RecordsModule {}