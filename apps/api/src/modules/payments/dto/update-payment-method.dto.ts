import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePaymentMethodDto } from './create-payment-method.dto';

export class UpdatePaymentMethodDto extends PartialType(
  OmitType(CreatePaymentMethodDto, ['establishmentId'] as const),
) {}