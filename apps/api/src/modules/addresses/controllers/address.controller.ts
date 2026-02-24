import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { CalculateDeliveryDto } from '../dto/calculate-delivery.dto';
import { GeocodeAddressDto } from '../dto/geocode-address.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateAddressDto,
  ) {
    return this.addressService.create(userId, createDto);
  }

  @Get('my-addresses')
  @ApiOperation({ summary: 'Listar meus endereços' })
  @ApiResponse({ status: 200, description: 'Lista de endereços do cliente' })
  findMyAddresses(@CurrentUser('id') userId: string) {
    return this.addressService.findByCustomer(userId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Listar endereços do cliente' })
  @ApiParam({ name: 'customerId', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Lista de endereços' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.addressService.findByCustomer(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar endereço por ID' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço encontrado' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdateAddressDto) {
    return this.addressService.update(id, updateDto);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Definir endereço como padrão' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço definido como padrão' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  setAsDefault(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.addressService.setAsDefault(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 204, description: 'Endereço deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }

  @Public()
  @Post('calculate-delivery')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calcular taxa e tempo de entrega',
    description: 'Calcula a taxa de entrega baseada na distância entre o estabelecimento e o endereço de entrega',
  })
  @ApiResponse({
    status: 200,
    description: 'Cálculo realizado com sucesso',
    schema: {
      example: {
        distance: 5.42,
        fee: 16.26,
        estimatedTime: 57,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou incompletos' })
  @ApiResponse({ status: 404, description: 'Estabelecimento ou endereço não encontrado' })
  calculateDelivery(@Body() calculateDto: CalculateDeliveryDto) {
    return this.addressService.calculateDeliveryFee(calculateDto);
  }

  @Public()
  @Post('geocode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter coordenadas de um CEP',
    description: 'Retorna latitude e longitude de um CEP brasileiro',
  })
  @ApiResponse({
    status: 200,
    description: 'Coordenadas obtidas com sucesso',
    schema: {
      example: {
        lat: -23.550520,
        lng: -46.633308,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'CEP inválido' })
  @ApiResponse({ status: 404, description: 'CEP não encontrado' })
  geocode(@Body() geocodeDto: GeocodeAddressDto) {
    return this.addressService.getCoordinates(geocodeDto.zipCode);
  }

  @Public()
  @Get('viacep/:zipCode')
  @ApiOperation({
    summary: 'Buscar dados de endereço por CEP',
    description: 'Consulta o ViaCEP para obter dados completos do endereço',
  })
  @ApiParam({ name: 'zipCode', example: '01000000' })
  @ApiResponse({
    status: 200,
    description: 'Dados do CEP obtidos com sucesso',
    schema: {
      example: {
        cep: '01000-000',
        logradouro: 'Praça da Sé',
        complemento: 'lado ímpar',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        gia: '1004',
        ddd: '11',
        siafi: '7107',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'CEP não encontrado' })
  async searchZipCode(@Param('zipCode') zipCode: string) {
    try {
      const axios = require('axios');
      const cleanZipCode = zipCode.replace(/\D/g, '');
      
      const response = await axios.get(
        `https://viacep.com.br/ws/${cleanZipCode}/json/`,
      );

      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }

      return response.data;
    } catch (error) {
      throw new Error('CEP não encontrado ou inválido');
    }
  }
}