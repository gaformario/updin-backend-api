import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateMesadaDto } from 'src/models/dtos/create-mesada.dto';
import { UpdateMesadaDto } from 'src/models/dtos/update-mesada.dto';
import { MesadasService } from '../services/mesadas.service';

@ApiTags('Mesadas')
@Controller('mesadas')
export class MesadasController {
  constructor(private readonly mesadasService: MesadasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova mesada' })
  create(@Body() body: CreateMesadaDto) {
    return this.mesadasService.createMesada(body);
  }

  @Patch(':mesadaId')
  @ApiOperation({ summary: 'Atualizar mesada existente' })
  @ApiParam({ name: 'mesadaId', example: 'uuid-mesada' })
  update(@Param('mesadaId') id: string, @Body() body: UpdateMesadaDto) {
    return this.mesadasService.updateMesada(id, body);
  }

  @Get(':mesadaId')
  @ApiOperation({ summary: 'Buscar mesada por ID' })
  @ApiParam({ name: 'mesadaId', example: 'uuid-mesada' })
  getById(@Param('mesadaId') id: string) {
    return this.mesadasService.getMesadaById(id);
  }
}
