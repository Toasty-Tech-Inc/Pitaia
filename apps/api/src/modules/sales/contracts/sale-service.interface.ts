import { Sale } from '@prisma/client';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { FilterSaleDto } from '../dto/filter-sale.dto';
import { SaleReportDto } from '../dto/sale-report.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';

export interface ISaleService {
  create(createSaleDto: CreateSaleDto): Promise<Sale>;
  findAll(filters: FilterSaleDto): Promise<IPaginatedResult<Sale>>;
  findOne(id: string): Promise<Sale>;
  getSalesByEstablishment(establishmentId: string): Promise<Sale[]>;
  getSalesByCashierSession(cashierSessionId: string): Promise<Sale[]>;
  getSalesReport(reportDto: SaleReportDto): Promise<any>;
  getDailyReport(establishmentId: string, date: Date): Promise<any>;
  getProductSalesReport(establishmentId: string, startDate: Date, endDate: Date): Promise<any>;
  getCustomerSalesReport(customerId: string, startDate: Date, endDate: Date): Promise<any>;
}