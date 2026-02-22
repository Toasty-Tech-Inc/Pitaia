import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { StockController } from './controllers/stock.controller';
import { StockService } from './services/stock.service';
import { StockMovementRepository } from './repositories/stock-movement.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [StockController],
  providers: [StockService, StockMovementRepository],
  exports: [StockService, StockMovementRepository],
})
export class StockModule {}
