import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CustomerAddress } from '@prisma/client';
import { AddressRepository } from '../repositories/address.repository';
import { IAddressService } from '../contracts/address-service.interface';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { CalculateDeliveryDto } from '../dto/calculate-delivery.dto';
import { PrismaService } from '../../../database/prisma.service';
import axios from 'axios';

@Injectable()
export class AddressService implements IAddressService {
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    customerId: string,
    dto: CreateAddressDto,
  ): Promise<CustomerAddress> {
    // Se for definir como default, remover default dos outros
    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    // Se for o primeiro endereço, definir como default automaticamente
    const existingAddresses = await this.addressRepository.findByCustomer(
      customerId,
    );
    const isFirstAddress = existingAddresses.length === 0;

    return this.addressRepository.create({
      ...dto,
      customerId,
      isDefault: dto.isDefault || isFirstAddress,
    });
  }

  async findByCustomer(customerId: string): Promise<CustomerAddress[]> {
    return this.addressRepository.findByCustomer(customerId);
  }

  async findOne(id: string): Promise<CustomerAddress> {
    const address = await this.addressRepository.findById(id);
    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }
    return address;
  }

  async update(id: string, dto: UpdateAddressDto): Promise<CustomerAddress> {
    const address = await this.findOne(id);

    // Se alterar para default, remover default dos outros
    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: address.customerId },
        data: { isDefault: false },
      });
    }

    return this.addressRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    const address = await this.findOne(id);

    // Se for o default, definir outro como default
    if (address.isDefault) {
      const otherAddresses = await this.addressRepository.findByCustomer(
        address.customerId,
      );
      const nextDefault = otherAddresses.find((a) => a.id !== id);

      if (nextDefault) {
        await this.addressRepository.update(nextDefault.id, {
          isDefault: true,
        });
      }
    }

    await this.addressRepository.delete(id);
  }

  async setAsDefault(
    id: string,
    customerId: string,
  ): Promise<CustomerAddress> {
    await this.findOne(id);
    return this.addressRepository.setAsDefault(id, customerId);
  }

  async calculateDeliveryFee(dto: CalculateDeliveryDto): Promise<{
    distance: number;
    fee: number;
    estimatedTime: number;
  }> {
    // Buscar estabelecimento
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: dto.establishmentId },
    });

    if (!establishment) {
      throw new NotFoundException('Estabelecimento não encontrado');
    }

    if (!establishment.latitude || !establishment.longitude) {
      throw new BadRequestException(
        'Estabelecimento não possui coordenadas cadastradas',
      );
    }

    let destLat: number;
    let destLng: number;

    // Determinar coordenadas de destino
    if (dto.addressId) {
      // Usar endereço do cliente
      const address = await this.findOne(dto.addressId);
      const coords = await this.getCoordinates(address.zipCode);
      destLat = coords.lat;
      destLng = coords.lng;
    } else if (dto.latitude && dto.longitude) {
      // Usar coordenadas fornecidas
      destLat = dto.latitude;
      destLng = dto.longitude;
    } else if (dto.zipCode) {
      // Usar CEP
      const coords = await this.getCoordinates(dto.zipCode);
      destLat = coords.lat;
      destLng = coords.lng;
    } else {
      throw new BadRequestException(
        'É necessário informar addressId, zipCode ou coordenadas',
      );
    }

    // Calcular distância (Haversine)
    const distance = this.calculateDistance(
      Number(establishment.latitude),
      Number(establishment.longitude),
      destLat,
      destLng,
    );

    // Calcular taxa de entrega (exemplo: R$ 3 por km, mínimo R$ 5)
    const feePerKm = 3.0;
    const minimumFee = 5.0;
    const calculatedFee = distance * feePerKm;
    const fee = Math.max(calculatedFee, minimumFee);

    // Estimar tempo (exemplo: 30 min + 5 min por km)
    const baseTime = 30; // minutos
    const timePerKm = 5; // minutos por km
    const estimatedTime = Math.ceil(baseTime + distance * timePerKm);

    return {
      distance: Math.round(distance * 100) / 100, // 2 casas decimais
      fee: Math.round(fee * 100) / 100,
      estimatedTime,
    };
  }

  async getCoordinates(zipCode: string): Promise<{ lat: number; lng: number }> {
    try {
      // Opção 1: Usar ViaCEP (gratuito, mas não retorna coordenadas)
      // Opção 2: Usar Google Geocoding API
      // Opção 3: Usar OpenStreetMap Nominatim (gratuito)

      // Exemplo com OpenStreetMap Nominatim
      const cleanZipCode = zipCode.replace(/\D/g, '');
      const formattedZipCode = `${cleanZipCode.slice(0, 5)}-${cleanZipCode.slice(5)}`;

      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            postalcode: formattedZipCode,
            country: 'Brazil',
            format: 'json',
            limit: 1,
          },
          headers: {
            'User-Agent': 'Pitaia-API/1.0',
          },
        },
      );

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
        };
      }

      throw new NotFoundException('CEP não encontrado');
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      throw new BadRequestException('Erro ao buscar coordenadas do CEP');
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    // Fórmula de Haversine para calcular distância entre duas coordenadas
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distância em km

    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}