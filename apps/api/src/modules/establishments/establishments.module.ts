import { Module } from '@nestjs/common';
import { EstablishmentService } from './services/establishment.service';
import { EstablishmentController } from './controllers/establishment.controller';
import { PublicEstablishmentController } from './controllers/public-establishment.controller';
import { EstablishmentRepository } from './repositories/establishment.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EstablishmentController, PublicEstablishmentController],
  providers: [EstablishmentService, EstablishmentRepository],
  exports: [EstablishmentService, EstablishmentRepository],
})
export class EstablishmentsModule {}