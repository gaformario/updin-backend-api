import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateMovimentacaoDto } from 'src/models/dtos/create-movimentacao.dto';
import { MovimentacoesService } from '../services/movimentacoes.service';

@ApiTags('Movimentações')
@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(private readonly movimentacoesService: MovimentacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar movimentação na conta' })
  create(
    @Body()
    body: CreateMovimentacaoDto,
  ) {
    return this.movimentacoesService.createMovimentacao(body);
  }

  @Get(':movimentacaoId')
  @ApiOperation({ summary: 'Buscar movimentação por ID' })
  @ApiParam({ name: 'movimentacaoId', example: 'uuid-movimentacao' })
  getById(@Param('movimentacaoId') id: string) {
    return this.movimentacoesService.getMovimentacaoById(id);
  }
}
