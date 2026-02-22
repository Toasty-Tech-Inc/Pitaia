import { CashMovement } from '@prisma/client';
import { CreateCashMovementDto } from '../dto/create-cash-movement.dto';
import { FilterCashMovementDto } from '../dto/filter-cash-movement.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface ICashMovementService {
  create(dto: CreateCashMovementDto): Promise<CashMovement>;
  findAll(filters: FilterCashMovementDto): Promise<IPaginatedResult<CashMovement>>;
  findOne(id: string): Promise<CashMovement>;
  findBySession(cashierSessionId: string): Promise<CashMovement[]>;
  getSessionSummary(cashierSessionId: string): Promise<any>;
  getDailyReport(establishmentId: string, date: string): Promise<any>;
}
