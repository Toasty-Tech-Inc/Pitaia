import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CashMovementController } from './controllers/cash-movement.controller';
import { CashMovementService } from './services/cash-movement.service';
import { CashMovementRepository } from './repositories/cash-movement.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [CashMovementController],
  providers: [CashMovementService, CashMovementRepository],
  exports: [CashMovementService, CashMovementRepository],
})
export class CashMovementsModule {}
