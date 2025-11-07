import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { PaymentController } from "./controllers/payment.controller";
import { PaymentService } from "./services/payment.service";
import { PaymentRepository } from "./repositories/payment.repository";
import { PaymentMethodRepository } from "./repositories/payment-method.repository";
import { PaymentMethodController } from "./controllers/payment-method.controller";

@Module({
    imports: [DatabaseModule],
    controllers: [PaymentController, PaymentMethodController],
    providers: [PaymentService, PaymentRepository, PaymentMethodRepository],
    exports: [PaymentService, PaymentRepository, PaymentMethodRepository],
})
export class PaymentsModule {}