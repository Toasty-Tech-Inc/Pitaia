import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CashierController } from './controllers/cashier.controller';
import { CashierService } from './services/cashier.service';
import { CashierSessionRepository } from './repositories/cashier-session.repository';
import { CashMovementRepository } from './repositories/cash-movement.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [CashierController],
  providers: [
    CashierService,
    CashierSessionRepository,
    CashMovementRepository,
  ],
  exports: [
    CashierService,
    CashierSessionRepository,
    CashMovementRepository,
  ],
})
export class CashierModule {}