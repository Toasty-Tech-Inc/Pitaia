import { PartialType } from '@nestjs/swagger';
import { CreateCustomerAddressDto } from './create-customer-address.dto';

export class UpdateCustomerAddressDto extends PartialType(
  CreateCustomerAddressDto,
) {}

