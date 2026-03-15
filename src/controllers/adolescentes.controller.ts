import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdolescentesService } from '../services/adolescentes.service';

@ApiTags('Adolescentes')
@Controller('adolescentes')
export class AdolescentesController {
  constructor(private readonly adolescentesService: AdolescentesService) {}

  @Get(':adolescenteId')
  @ApiOperation({ summary: 'Buscar adolescente por ID' })
  @ApiParam({ name: 'adolescenteId', example: 'uuid-adolescente' })
  getById(@Param('adolescenteId') id: string) {
    return this.adolescentesService.getAdolescenteById(id);
  }

  @Get(':adolescenteId/conta')
  @ApiOperation({ summary: 'Buscar conta de adolescente' })
  @ApiParam({ name: 'adolescenteId', example: 'uuid-adolescente' })
  getConta(@Param('adolescenteId') id: string) {
    return this.adolescentesService.getAdolescenteConta(id);
  }

  @Get(':adolescenteId/mesadas')
  @ApiOperation({ summary: 'Listar mesadas de um adolescente' })
  @ApiParam({ name: 'adolescenteId', example: 'uuid-adolescente' })
  getMesadas(@Param('adolescenteId') id: string) {
    return this.adolescentesService.getAdolescenteMesadas(id);
  }

  @Get(':adolescenteId/dashboard')
  @ApiOperation({ summary: 'Dashboard financeiro do adolescente' })
  @ApiParam({ name: 'adolescenteId', example: 'uuid-adolescente' })
  getDashboard(@Param('adolescenteId') id: string) {
    return this.adolescentesService.getAdolescenteDashboard(id);
  }
}
