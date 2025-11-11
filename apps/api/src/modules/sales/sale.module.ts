import { Module } from "@nestjs/common";
import { SaleController } from "./controllers/sale.controller";
import { SaleService } from "./services/sale.service";
import { SaleRepository } from "./repositories/sale.repository";

@Module({
    controllers: [SaleController],
    providers: [SaleService, SaleRepository],
    exports: [SaleService, SaleRepository]
})
export class SaleModule {}