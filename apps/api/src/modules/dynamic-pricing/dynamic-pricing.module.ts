import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DynamicPriceController } from './controllers/dynamic-price.controller';
import { DynamicPriceService } from './services/dynamic-price.service';
import { DynamicPriceRepository } from './repositories/dynamic-price.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [DynamicPriceController],
  providers: [DynamicPriceService, DynamicPriceRepository],
  exports: [DynamicPriceService, DynamicPriceRepository],
})
export class DynamicPricingModule {}
