import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '@prisma/client';

export class UpdateTableStatusDto {
  @ApiProperty({
    enum: TableStatus,
    description: 'Novo status da mesa',
  })
  @IsEnum(TableStatus)
  status: TableStatus;
}

