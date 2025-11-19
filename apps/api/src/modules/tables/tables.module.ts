import { Module } from '@nestjs/common';
import { TableService } from './services/table.service';
import { TableController } from './controllers/table.controller';
import { TableRepository } from './repositories/table.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TableController],
  providers: [TableService, TableRepository],
  exports: [TableService, TableRepository],
})
export class TablesModule {}

