import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { LoyaltyController } from './controllers/loyalty.controller';
import { LoyaltyService } from './services/loyalty.service';
import { LoyaltyRepository } from './repositories/loyalty.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [LoyaltyController],
  providers: [LoyaltyService, LoyaltyRepository],
  exports: [LoyaltyService, LoyaltyRepository],
})
export class LoyaltyModule {}
