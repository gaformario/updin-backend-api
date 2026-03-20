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
  @ApiOperation({ summary: 'Ranking global de adolescentes por pontuacao' })
  async getGlobalRanking(@CurrentUser() user: AuthenticatedUser) {
    return this.rankingService.getGlobalRanking(user.userId);
  }

  @Get('responsaveis/:responsavelId')
  @ApiOperation({
    summary: 'Ranking dos adolescentes vinculados ao responsavel',
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
}
