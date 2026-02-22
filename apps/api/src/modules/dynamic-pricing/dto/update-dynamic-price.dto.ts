import { PartialType } from '@nestjs/swagger';
import { CreateDynamicPriceDto } from './create-dynamic-price.dto';

export class UpdateDynamicPriceDto extends PartialType(CreateDynamicPriceDto) {}
