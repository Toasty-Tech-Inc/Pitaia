import { PartialType } from '@nestjs/swagger';
import { CreateModifierOptionDto } from './create-modifier-option.dto';

export class UpdateModifierOptionDto extends PartialType(CreateModifierOptionDto) {}