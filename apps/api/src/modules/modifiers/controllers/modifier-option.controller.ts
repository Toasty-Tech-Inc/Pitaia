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
import { ModifierService } from '../services/modifier.service';
import { CreateModifierOptionDto } from '../dto/create-modifier-option.dto';
import { UpdateModifierOptionDto } from '../dto/update-modifier-option.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Modifier Options')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modifier-options')
export class ModifierOptionController {
  constructor(private readonly modifierService: ModifierService) {}

  @Post(':modifierId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Criar nova opção de modificador' })
  @ApiParam({ name: 'modifierId', description: 'ID do modificador' })
  @ApiResponse({ status: 201, description: 'Opção criada com sucesso' })
  @ApiResponse({ status: 404, description: 'Modificador não encontrado' })
  create(
    @Param('modifierId') modifierId: string,
    @Body() createDto: CreateModifierOptionDto,
  ) {
    return this.modifierService.createOption(modifierId, createDto);
  }

  @Get('modifier/:modifierId')
  @Public()
  @ApiOperation({ summary: 'Listar opções de um modificador' })
  @ApiParam({ name: 'modifierId', description: 'ID do modificador' })
  @ApiResponse({ status: 200, description: 'Lista de opções' })
  findByModifier(@Param('modifierId') modifierId: string) {
    return this.modifierService.findOptionsByModifier(modifierId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Buscar opção por ID' })
  @ApiParam({ name: 'id', description: 'ID da opção' })
  @ApiResponse({ status: 200, description: 'Opção encontrada' })
  @ApiResponse({ status: 404, description: 'Opção não encontrada' })
  findOne(@Param('id') id: string) {
    return this.modifierService.findOneOption(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualizar opção' })
  @ApiParam({ name: 'id', description: 'ID da opção' })
  @ApiResponse({ status: 200, description: 'Opção atualizada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateModifierOptionDto) {
    return this.modifierService.updateOption(id, updateDto);
  }

  @Patch(':id/set-default')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Definir opção como padrão' })
  @ApiParam({ name: 'id', description: 'ID da opção' })
  @ApiResponse({ status: 200, description: 'Opção definida como padrão' })
  setAsDefault(@Param('id') id: string) {
    return this.modifierService.setAsDefault(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar opção' })
  @ApiParam({ name: 'id', description: 'ID da opção' })
  @ApiResponse({ status: 204, description: 'Opção deletada' })
  remove(@Param('id') id: string) {
    return this.modifierService.removeOption(id);
  }
}