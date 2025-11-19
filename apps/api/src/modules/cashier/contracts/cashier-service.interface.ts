import { CashierSession, CashMovement } from '@prisma/client';
import { OpenCashierSessionDto } from '../dto/open-cashier-session.dto';
import { CloseCashierSessionDto } from '../dto/close-cashier-session.dto';
import { CreateCashMovementDto } from '../dto/create-cash-movement.dto';
import { FilterCashierSessionDto } from '../dto/filter-cashier-session.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface ICashierService {
  openSession(dto: OpenCashierSessionDto): Promise<CashierSession>;
  closeSession(id: string, dto: CloseCashierSessionDto): Promise<CashierSession>;
  findAll(filters: FilterCashierSessionDto): Promise<IPaginatedResult<CashierSession>>;
  findOne(id: string): Promise<CashierSession>;
  getActiveSession(userId: string): Promise<CashierSession | null>;
  
  createMovement(dto: CreateCashMovementDto): Promise<CashMovement>;
  getMovementsBySession(sessionId: string): Promise<CashMovement[]>;
  
  getSessionReport(sessionId: string): Promise<any>;
  getDailyReport(establishmentId: string, date: Date): Promise<any>;
}