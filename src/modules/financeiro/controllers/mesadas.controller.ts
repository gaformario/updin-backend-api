import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/auth/interfaces/authenticated-request.interface';
import { CreateMesadaDto } from '../dto/create-mesada.dto';
import { UpdateMesadaDto } from '../dto/update-mesada.dto';
import { MesadasService } from '../services/mesadas.service';

@ApiTags('Mesadas')
@ApiBearerAuth()
@Controller()
export class MesadasController {
  constructor(private readonly mesadasService: MesadasService) {}

  @Post('adolescentes/:adolescenteId/mesadas')
  @ApiOperation({ summary: 'Criar mesada para um adolescente vinculado' })
  async create(
    @Param('adolescenteId') adolescenteId: string,
    @Body() body: CreateMesadaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mesadasService.createMesada(user.userId, adolescenteId, body);
  }

  @Get('adolescentes/:adolescenteId/mesadas')
  @ApiOperation({ summary: 'Listar mesadas de um adolescente' })
  async listByAdolescente(
    @Param('adolescenteId') adolescenteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mesadasService.listByAdolescente(user.userId, adolescenteId);
  }

  @Patch('mesadas/:mesadaId')
  @ApiOperation({ summary: 'Atualizar mesada existente' })
  @ApiParam({ name: 'mesadaId', example: 'uuid-mesada' })
  async update(
    @Param('mesadaId') mesadaId: string,
    @Body() body: UpdateMesadaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mesadasService.updateMesada(user.userId, mesadaId, body);
  }

  @Get('mesadas/:mesadaId')
  @ApiOperation({ summary: 'Buscar mesada por ID' })
  @ApiParam({ name: 'mesadaId', example: 'uuid-mesada' })
  async getById(
    @Param('mesadaId') mesadaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mesadasService.getMesadaById(user.userId, mesadaId);
  }
}
