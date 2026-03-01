import { ModifiersModule } from './../modules/modifiers/modifiers.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { HealthModule } from '../modules/health/health.module';
import { EstablishmentsModule } from '../modules/establishments/establishments.module';
import { ProductsModule } from '../modules/products/product.module';
import { OrdersModule } from '../modules/orders/orders.module';
import { PaymentsModule } from '../modules/payments/payment.module';
import { AddressesModule } from '../modules/addresses/addresses.module';
import { SaleModule } from '../modules/sales/sale.module';
import { CashierModule } from '../modules/cashier/cashier.module';
import { TablesModule } from '../modules/tables/tables.module';
import { CouponsModule } from '../modules/coupons/coupons.module';
import { CustomersModule } from '../modules/customers/customers.module';
import { CategoriesModule } from '../modules/categories/categories.module';
import { StockModule } from '../modules/stock/stock.module';
import { LoyaltyModule } from '../modules/loyalty/loyalty.module';
import { DynamicPricingModule } from '../modules/dynamic-pricing/dynamic-pricing.module';
import { CashMovementsModule } from '../modules/cash-movements/cash-movements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isE2E = configService.get('NODE_ENV') === 'test' || configService.get('E2E_TEST') === 'true';
        return [{
          ttl: 60000,
          // Disable rate limiting for E2E tests (very high limit)
          limit: isE2E ? 10000 : 10,
        }];
      },
    }),
    HealthModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    EstablishmentsModule,
    ProductsModule,
    ModifiersModule,
    OrdersModule,
    SaleModule,
    CashierModule,
    PaymentsModule,
    AddressesModule,
    TablesModule,
    CouponsModule,
    CustomersModule,
    CategoriesModule,
    StockModule,
    LoyaltyModule,
    DynamicPricingModule,
    CashMovementsModule,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}