import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/auth/interfaces/authenticated-request.interface';
import { ContasService } from '../services/contas.service';

@ApiTags('Contas')
@ApiBearerAuth()
@Controller('contas')
export class ContasController {
  constructor(private readonly contasService: ContasService) {}

  @Get(':contaId')
  @ApiOperation({ summary: 'Buscar conta por ID' })
  @ApiParam({ name: 'contaId', example: 'uuid-conta' })
  async getById(
    @Param('contaId') contaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contasService.getContaById(user.userId, contaId);
  }

  @Get(':contaId/movimentacoes')
  @ApiOperation({ summary: 'Listar movimentacoes de uma conta' })
  @ApiParam({ name: 'contaId', example: 'uuid-conta' })
  async getMovimentacoes(
    @Param('contaId') contaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contasService.getContaMovimentacoes(user.userId, contaId);
  }
}
