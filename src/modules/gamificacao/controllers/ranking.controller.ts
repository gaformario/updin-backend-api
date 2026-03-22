import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/auth/interfaces/authenticated-request.interface';
import { RankingService } from '../services/ranking.service';

@ApiTags('Ranking')
@ApiBearerAuth()
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get('global')
  @ApiOperation({ summary: 'Ranking global geral de adolescentes por XP acumulado' })
  async getGlobalRanking(@CurrentUser() user: AuthenticatedUser) {
    return this.rankingService.getGlobalRanking(user.userId);
  }

  @Get('global/semanal')
  @ApiOperation({ summary: 'Ranking global semanal de adolescentes por XP acumulado' })
  async getGlobalWeeklyRanking(@CurrentUser() user: AuthenticatedUser) {
    return this.rankingService.getGlobalWeeklyRanking(user.userId);
  }

  @Get('global/mensal')
  @ApiOperation({ summary: 'Ranking global mensal de adolescentes por XP acumulado' })
  async getGlobalMonthlyRanking(@CurrentUser() user: AuthenticatedUser) {
    return this.rankingService.getGlobalMonthlyRanking(user.userId);
  }

  @Get('responsaveis/:responsavelId')
  @ApiOperation({
    summary: 'Ranking geral dos adolescentes vinculados ao responsavel por XP acumulado',
  })
  async getRankingByResponsavel(
    @Param('responsavelId') responsavelId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rankingService.getRankingByResponsavel(
      user.userId,
      responsavelId,
    );
  }

  @Get('responsaveis/:responsavelId/semanal')
  @ApiOperation({
    summary: 'Ranking semanal dos adolescentes vinculados ao responsavel por XP acumulado',
  })
  async getWeeklyRankingByResponsavel(
    @Param('responsavelId') responsavelId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rankingService.getWeeklyRankingByResponsavel(
      user.userId,
      responsavelId,
    );
  }

  @Get('responsaveis/:responsavelId/mensal')
  @ApiOperation({
    summary: 'Ranking mensal dos adolescentes vinculados ao responsavel por XP acumulado',
  })
  async getMonthlyRankingByResponsavel(
    @Param('responsavelId') responsavelId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rankingService.getMonthlyRankingByResponsavel(
      user.userId,
      responsavelId,
    );
  }
}
