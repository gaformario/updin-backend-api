import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateAdolescenteDto } from 'src/models/dtos/creata-adolescente.dto';
import { ResponsaveisService } from '../services/responsaveis.service';

@ApiTags('Responsáveis')
@Controller('responsaveis')
export class ResponsaveisController {
  constructor(private readonly responsaveisService: ResponsaveisService) {}

  @Post(':responsavelId/adolescentes')
  @ApiOperation({ summary: 'Cadastrar adolescente vinculado a um responsável' })
  @ApiParam({ name: 'responsavelId', example: 'uuid-do-responsavel' })
  createAdolescente(
    @Param('responsavelId') responsavelId: string,
    @Body() body: CreateAdolescenteDto,
  ) {
    return this.responsaveisService.createAdolescente(responsavelId, body);
  }

  @Get(':responsavelId')
  @ApiOperation({ summary: 'Buscar responsável pelo id' })
  @ApiParam({ name: 'responsavelId', example: 'uuid-do-responsavel' })
  getById(@Param('responsavelId') responsavelId: string) {
    return this.responsaveisService.findById(responsavelId);
  }

  @Get(':responsavelId/adolescentes')
  @ApiOperation({ summary: 'Listar adolescentes pelo id do responsável' })
  @ApiParam({ name: 'responsavelId', example: 'uuid-do-responsavel' })
  getAdolescentesByResponsavelId(
    @Param('responsavelId') responsavelId: string,
  ) {
    return this.responsaveisService.findAdolescentesByResponsavelId(
      responsavelId,
    );
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Buscar responsável pelo id do usuário' })
  @ApiParam({ name: 'usuarioId', example: 'uuid-do-usuario' })
  getByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.responsaveisService.findByUsuarioId(usuarioId);
  }

  @Get('usuario/:usuarioId/adolescentes')
  @ApiOperation({
    summary: 'Listar adolescentes pelo id do usuário do responsável',
  })
  @ApiParam({ name: 'usuarioId', example: 'uuid-do-usuario' })
  getAdolescentesByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.responsaveisService.findAdolescentesByUsuarioId(usuarioId);
  }
}
