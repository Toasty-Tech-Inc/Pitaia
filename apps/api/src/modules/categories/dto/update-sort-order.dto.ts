import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSortOrderDto {
  @ApiProperty({
    example: 1,
    description: 'Nova ordem de exibição',
  })
  @IsInt()
  @Min(0)
  sortOrder: number;
}

