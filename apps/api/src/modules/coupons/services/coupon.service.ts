import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Coupon, DiscountType, Prisma } from '@prisma/client';
import { CouponRepository } from '../repositories/coupon.repository';
import { ICouponService } from '../contracts/coupon-service.interface';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { FilterCouponDto } from '../dto/filter-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';
import { IPaginatedResult } from '../../../common/contracts/base-repository.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CouponService implements ICouponService {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    // Verificar se código já existe
    const existingCoupon = await this.couponRepository.findByCode(
      createCouponDto.code,
    );

    if (existingCoupon) {
      throw new ConflictException('Código de cupom já cadastrado');
    }

    // Validar datas
    const validFrom = new Date(createCouponDto.validFrom);
    if (createCouponDto.validUntil) {
      const validUntil = new Date(createCouponDto.validUntil);
      if (validUntil <= validFrom) {
        throw new BadRequestException(
          'Data de fim deve ser posterior à data de início',
        );
      }
    }

    // Validar valores de desconto
    if (
      createCouponDto.discountType === DiscountType.PERCENTAGE
      && createCouponDto.discountValue.greaterThan(100)
    ) {
      throw new BadRequestException(
        'Desconto percentual não pode ser maior que 100%',
      );
    }

    // Converter datas para DateTime
    const data = {
      ...createCouponDto,
      validFrom: validFrom,
      validUntil: createCouponDto.validUntil
        ? new Date(createCouponDto.validUntil)
        : null,
      discountValue: new Prisma.Decimal(createCouponDto.discountValue),
      minPurchase: createCouponDto.minPurchase
        ? new Prisma.Decimal(createCouponDto.minPurchase)
        : null,
      maxDiscount: createCouponDto.maxDiscount
        ? new Prisma.Decimal(createCouponDto.maxDiscount)
        : null,
      usageCount: 0,
    };

    return this.couponRepository.create(data);
  }

  async findAll(filters: FilterCouponDto): Promise<IPaginatedResult<Coupon>> {
    const {
      search,
      discountType,
      isActive,
      isPublic,
      aiGenerated,
      valid,
      validFrom,
      validUntil,
      ...pagination
    } = filters;

    const where: any = {};

    if (discountType) {
      where.discountType = discountType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    if (aiGenerated !== undefined) {
      where.aiGenerated = aiGenerated;
    }

    // Construir condições AND para combinar filtros
    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Filtrar por validade
    if (valid !== undefined) {
      const now = new Date();
      if (valid) {
        where.isActive = true;
        where.validFrom = { lte: now };
        andConditions.push({
          OR: [
            { validUntil: null },
            { validUntil: { gte: now } },
          ],
        });
      } else {
        andConditions.push({
          OR: [
            { isActive: false },
            { validFrom: { gt: now } },
            { validUntil: { lt: now } },
          ],
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    if (validFrom) {
      where.validFrom = { gte: new Date(validFrom) };
    }

    if (validUntil) {
      where.validUntil = { lte: new Date(validUntil) };
    }

    const result = await this.couponRepository.paginate({
      ...pagination,
      ...where,
    });

    return result;
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado');
    }
    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);

    // Validar datas se fornecidas
    if (updateCouponDto.validFrom || updateCouponDto.validUntil) {
      const validFrom = updateCouponDto.validFrom
        ? new Date(updateCouponDto.validFrom)
        : coupon.validFrom;
      const validUntil = updateCouponDto.validUntil
        ? new Date(updateCouponDto.validUntil)
        : coupon.validUntil;

      if (validUntil && validUntil <= validFrom) {
        throw new BadRequestException(
          'Data de fim deve ser posterior à data de início',
        );
      }
    }

    // Validar valores de desconto
    const discountType =
      updateCouponDto.discountType ?? coupon.discountType;
    const discountValue = updateCouponDto.discountValue
      ? new Prisma.Decimal(updateCouponDto.discountValue)
      : coupon.discountValue;

    if (
      discountType === DiscountType.PERCENTAGE &&
      Number(discountValue) > 100
    ) {
      throw new BadRequestException(
        'Desconto percentual não pode ser maior que 100%',
      );
    }

    // Preparar dados para atualização
    const data: any = { ...updateCouponDto };

    if (updateCouponDto.validFrom) {
      data.validFrom = new Date(updateCouponDto.validFrom);
    }

    if (updateCouponDto.validUntil !== undefined) {
      data.validUntil = updateCouponDto.validUntil
        ? new Date(updateCouponDto.validUntil)
        : null;
    }

    if (updateCouponDto.discountValue) {
      data.discountValue = new Prisma.Decimal(updateCouponDto.discountValue);
    }

    if (updateCouponDto.minPurchase !== undefined) {
      data.minPurchase = updateCouponDto.minPurchase
        ? new Prisma.Decimal(updateCouponDto.minPurchase)
        : null;
    }

    if (updateCouponDto.maxDiscount !== undefined) {
      data.maxDiscount = updateCouponDto.maxDiscount
        ? new Prisma.Decimal(updateCouponDto.maxDiscount)
        : null;
    }

    return this.couponRepository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.couponRepository.delete(id);
  }

  async validateCoupon(validateCouponDto: ValidateCouponDto): Promise<Coupon> {
    const { code, purchaseAmount, customerId } = validateCouponDto;

    // Buscar cupom
    const coupon = await this.couponRepository.findByCode(code);
    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado');
    }

    // Verificar se está ativo
    if (!coupon.isActive) {
      throw new BadRequestException('Cupom não está ativo');
    }

    // Verificar validade
    const now = new Date();
    if (coupon.validFrom > now) {
      throw new BadRequestException('Cupom ainda não está válido');
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      throw new BadRequestException('Cupom expirado');
    }

    // Verificar limite de uso total
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Cupom atingiu o limite de usos');
    }

    // Verificar valor mínimo de compra
    if (coupon.minPurchase) {
      const minPurchase = Number(coupon.minPurchase);
      const amount = Number(purchaseAmount);
      if (amount < minPurchase) {
        throw new BadRequestException(
          `Valor mínimo de compra é R$ ${minPurchase.toFixed(2)}`,
        );
      }
    }

    // Verificar limite por cliente
    if (customerId && coupon.perCustomerLimit) {
      const customerUsageCount = await this.prisma.order.count({
        where: {
          customerId,
          couponId: coupon.id,
        },
      });

      if (customerUsageCount >= coupon.perCustomerLimit) {
        throw new BadRequestException(
          'Você já utilizou este cupom o máximo de vezes permitido',
        );
      }
    }

    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findByCode(code);
    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado');
    }
    return coupon;
  }

  async toggleActive(id: string): Promise<Coupon> {
    const coupon = await this.findOne(id);
    return this.couponRepository.update(id, {
      isActive: !coupon.isActive,
    });
  }

  async findPublicCoupons(): Promise<Coupon[]> {
    return this.couponRepository.findPublicCoupons();
  }
}

