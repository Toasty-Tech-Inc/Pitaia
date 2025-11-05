import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Product, StockMovementType, Prisma } from '@prisma/client';
import { ProductRepository } from '../repositories/product.repository';
import { IProductService } from '../contracts/product-service.interface';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { UpdateStockDto, StockOperationType } from '../dto/update-stock.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Verificar se SKU já existe
    if (createProductDto.sku) {
      const existingSku = await this.productRepository.findBySku(
        createProductDto.sku,
      );
      if (existingSku) {
        throw new ConflictException('SKU já cadastrado');
      }
    }

    // Verificar se código de barras já existe
    if (createProductDto.barcode) {
      const existingBarcode = await this.productRepository.findByBarcode(
        createProductDto.barcode,
      );
      if (existingBarcode) {
        throw new ConflictException('Código de barras já cadastrado');
      }
    }

    // Criar produto
    const product = await this.productRepository.create(createProductDto);

    // Se rastrear estoque e tiver estoque inicial, criar movimento
    if (createProductDto.trackInventory && createProductDto.currentStock) {
      await this.createStockMovement(
        product.id,
        StockMovementType.ADJUSTMENT,
        new Prisma.Decimal(createProductDto.currentStock),
        new Prisma.Decimal(0),
        new Prisma.Decimal(createProductDto.currentStock),
        'Estoque inicial',
        null,
      );
    }

    return product;
  }

  async findAll(
    filters: FilterProductDto,
  ): Promise<IPaginatedResult<Product>> {
    const {
      search,
      establishmentId,
      categoryId,
      isActive,
      isAvailable,
      isFeatured,
      trackInventory,
      lowStock,
      minPrice,
      maxPrice,
      ...pagination
    } = filters;

    const where: any = {};

    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
        { tags: { has: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (trackInventory !== undefined) {
      where.trackInventory = trackInventory;
    }

    if (lowStock) {
      where.trackInventory = true;
      where.AND = [
        {
          currentStock: {
            not: null,
          },
        },
        {
          minStock: {
            not: null,
          },
        },
      ];
      // Não podemos comparar diretamente com fields no where
      // Vamos fazer isso após buscar os resultados
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(maxPrice);
      }
    }

    const result = await this.productRepository.paginate({
      ...pagination,
      ...where,
    });

    // Filtrar lowStock após buscar
    if (lowStock) {
      result.data = result.data.filter((product) => {
        if (!product.currentStock || !product.minStock) return false;
        return Number(product.currentStock) <= Number(product.minStock);
      });
      result.total = result.data.length;
    }

    return result;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    // Verificar SKU se alterado
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepository.findBySku(
        updateProductDto.sku,
      );
      if (existingSku) {
        throw new ConflictException('SKU já cadastrado');
      }
    }

    // Verificar código de barras se alterado
    if (
      updateProductDto.barcode &&
      updateProductDto.barcode !== product.barcode
    ) {
      const existingBarcode = await this.productRepository.findByBarcode(
        updateProductDto.barcode,
      );
      if (existingBarcode) {
        throw new ConflictException('Código de barras já cadastrado');
      }
    }

    return this.productRepository.update(id, updateProductDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.productRepository.delete(id);
  }

  async updateStock(
    id: string,
    updateStockDto: UpdateStockDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (!product.trackInventory) {
      throw new BadRequestException(
        'Este produto não possui controle de estoque',
      );
    }

    const currentStock = product.currentStock
      ? Number(product.currentStock)
      : 0;
    let newStock: number;
    let movementType: StockMovementType;

    switch (updateStockDto.operation) {
      case StockOperationType.ADD:
        newStock = currentStock + updateStockDto.quantity;
        movementType = StockMovementType.PURCHASE;
        break;

      case StockOperationType.SUBTRACT:
        if (currentStock < updateStockDto.quantity) {
          throw new BadRequestException('Estoque insuficiente');
        }
        newStock = currentStock - updateStockDto.quantity;
        movementType = StockMovementType.SALE;
        break;

      case StockOperationType.SET:
        newStock = updateStockDto.quantity;
        movementType = StockMovementType.ADJUSTMENT;
        break;

      default:
        throw new BadRequestException('Operação inválida');
    }

    // Atualizar estoque
    const updatedProduct = await this.productRepository.updateStock(
      id,
      newStock,
    );

    // Registrar movimento de estoque
    await this.createStockMovement(
      id,
      movementType,
      new Prisma.Decimal(updateStockDto.quantity),
      new Prisma.Decimal(currentStock),
      new Prisma.Decimal(newStock),
      updateStockDto.reason || 'Ajuste manual',
      updateStockDto.reference || null,
    );

    return updatedProduct;
  }

  async toggleAvailability(id: string): Promise<Product> {
    await this.findOne(id);
    return this.productRepository.toggleAvailability(id);
  }

  async getLowStock(establishmentId: string): Promise<Product[]> {
    return this.productRepository.findLowStock(establishmentId);
  }

  async getFeatured(establishmentId: string): Promise<Product[]> {
    return this.productRepository.findFeatured(establishmentId);
  }

  private async createStockMovement(
    productId: string,
    type: StockMovementType,
    quantity: Prisma.Decimal,
    previousStock: Prisma.Decimal,
    newStock: Prisma.Decimal,
    reason?: string,
    reference?: string | null,
  ): Promise<void> {
    await this.prisma.stockMovement.create({
      data: {
        productId,
        type,
        quantity,
        previousStock,
        newStock,
        reason,
        reference,
      },
    });
  }
}