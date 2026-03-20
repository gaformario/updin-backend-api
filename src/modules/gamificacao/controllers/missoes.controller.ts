import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/auth/interfaces/authenticated-request.interface';
import { AssignMissaoDto } from '../dto/assign-missao.dto';
import { CompleteMissaoDto } from '../dto/complete-missao.dto';
import { CreateMissaoDto } from '../dto/create-missao.dto';
import { ValidateMissaoDto } from '../dto/validate-missao.dto';
import { MissoesService } from '../services/missoes.service';

@ApiTags('Missoes')
@ApiBearerAuth()
@Controller()
export class MissoesController {
  constructor(private readonly missoesService: MissoesService) {}

  @Post('responsaveis/:responsavelId/missoes')
  @ApiOperation({ summary: 'Criar missao para o responsavel autenticado' })
  async createMissao(
    @Param('responsavelId') responsavelId: string,
    @Body() body: CreateMissaoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.missoesService.createMissao(user.userId, responsavelId, body);
  }

  @Get('responsaveis/:responsavelId/missoes')
  @ApiOperation({ summary: 'Listar missoes do responsavel' })
  async listMissoesByResponsavel(
    @Param('responsavelId') responsavelId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.missoesService.listMissoesByResponsavel(
      user.userId,
      responsavelId,
    );
  }

  @Post('missoes/:missaoId/atribuicoes')
  @ApiOperation({ summary: 'Atribuir missao a um adolescente' })
  async assignMissao(
    @Param('missaoId') missaoId: string,
    @Body() body: AssignMissaoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.missoesService.assignMissao(user.userId, missaoId, body);
  }

  @Get('adolescentes/:adolescenteId/missoes')
  @ApiOperation({ summary: 'Listar missoes atribuidas ao adolescente' })
  async listMissoesByAdolescente(
    @Param('adolescenteId') adolescenteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.missoesService.listMissoesByAdolescente(
      user.userId,
      adolescenteId,
    );
  }

  @Get('missoes/atribuicoes/:atribuicaoId')
  @ApiOperation({ summary: 'Detalhar atribuicao de missao' })
  @ApiParam({ name: 'atribuicaoId', example: 'uuid-atribuicao' })
  async getAtribuicao(
    @Param('atribuicaoId') atribuicaoId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.missoesService.getAtribuicao(user.userId, atribuicaoId);
  }

  @Patch('missoes/atribuicoes/:atribuicaoId/concluir')
  @ApiOperation({ summary: 'Marcar missao como concluida' })
  async concluirMissao(
    @Param('atribuicaoId') atribuicaoId: string,
    @Body() body: CompleteMissaoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.missoesService.completeMissao(user.userId, atribuicaoId, body);
  }

  @Patch('missoes/atribuicoes/:atribuicaoId/validar')
  @ApiOperation({ summary: 'Validar missao concluida e creditar pontuacao' })
  async validarMissao(
    @Param('atribuicaoId') atribuicaoId: string,
    @Body() body: ValidateMissaoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.missoesService.validateMissao(user.userId, atribuicaoId, body);
  }
}
