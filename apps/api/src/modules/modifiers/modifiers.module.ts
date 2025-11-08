import { Module } from '@nestjs/common';
import { ModifierService } from './services/modifier.service';
import { ProductModifierController } from './controllers/product-modifier.controller';
import { ModifierOptionController } from './controllers/modifier-option.controller';
import { ProductModifierRepository } from './repositories/product-modifier.repository';
import { ModifierOptionRepository } from './repositories/modifier-option.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductModifierController, ModifierOptionController],
  providers: [
    ModifierService,
    ProductModifierRepository,
    ModifierOptionRepository,
  ],
  exports: [
    ModifierService,
    ProductModifierRepository,
    ModifierOptionRepository,
  ],
})
export class ModifiersModule {}