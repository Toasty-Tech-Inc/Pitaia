import { IsArray, ValidateNested, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UpdateStockDto } from './update-stock.dto';

class ProductStockUpdate {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => UpdateStockDto)
  stockUpdate: UpdateStockDto;
}

export class BulkUpdateStockDto {
  @ApiProperty({ type: [ProductStockUpdate] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductStockUpdate)
  products: ProductStockUpdate[];
}