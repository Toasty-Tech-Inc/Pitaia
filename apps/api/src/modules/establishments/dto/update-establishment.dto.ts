import { PartialType } from '@nestjs/swagger';
import { CreateEstablishmentDto } from './create-establishment.dto';

export class UpdateEstablishmentDto extends PartialType(CreateEstablishmentDto) {}