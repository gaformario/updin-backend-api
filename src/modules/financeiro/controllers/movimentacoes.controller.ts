import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/auth/interfaces/authenticated-request.interface';
import { CreateMovimentacaoDto } from '../dto/create-movimentacao.dto';
import { MovimentacoesService } from '../services/movimentacoes.service';

@ApiTags('Movimentacoes')
@ApiBearerAuth()
@Controller()
export class MovimentacoesController {
  constructor(private readonly movimentacoesService: MovimentacoesService) {}

  @Post('contas/:contaId/movimentacoes')
  @ApiOperation({ summary: 'Registrar movimentacao na conta' })
  async create(
    @Param('contaId') contaId: string,
    @Body() body: CreateMovimentacaoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.movimentacoesService.createMovimentacao(
      user.userId,
      contaId,
      body,
    );
  }

  @Get('movimentacoes/:movimentacaoId')
  @ApiOperation({ summary: 'Buscar movimentacao por ID' })
  @ApiParam({ name: 'movimentacaoId', example: 'uuid-movimentacao' })
  async getById(
    @Param('movimentacaoId') movimentacaoId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.movimentacoesService.getMovimentacaoById(
      user.userId,
      movimentacaoId,
    );
  }
}
