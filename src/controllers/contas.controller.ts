import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ContasService } from '../services/contas.service';

@ApiTags('Contas')
@Controller('contas')
export class ContasController {
  constructor(private readonly contasService: ContasService) {}

  @Get(':contaId')
  @ApiOperation({ summary: 'Buscar conta por ID' })
  @ApiParam({ name: 'contaId', example: 'uuid-conta' })
  getById(@Param('contaId') id: string) {
    return this.contasService.getContaById(id);
  }

  @Get(':contaId/movimentacoes')
  @ApiOperation({ summary: 'Listar movimentações de uma conta' })
  @ApiParam({ name: 'contaId', example: 'uuid-conta' })
  getMovimentacoes(@Param('contaId') id: string) {
    return this.contasService.getContaMovimentacoes(id);
  }
}
