import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CashMovementType } from '@prisma/client';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

export class FilterCashMovementDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cashierSessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  establishmentId?: string;

  @ApiPropertyOptional({ enum: CashMovementType })
  @IsOptional()
  @IsEnum(CashMovementType)
  type?: CashMovementType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
