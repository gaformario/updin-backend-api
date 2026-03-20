import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MissoesController } from './controllers/missoes.controller';
import { QuizzesController } from './controllers/quizzes.controller';
import { RankingController } from './controllers/ranking.controller';
import { MissoesService } from './services/missoes.service';
import { QuizzesService } from './services/quizzes.service';
import { RankingService } from './services/ranking.service';

@Module({
  imports: [AuthModule],
  controllers: [MissoesController, QuizzesController, RankingController],
  providers: [MissoesService, QuizzesService, RankingService],
  exports: [MissoesService, QuizzesService, RankingService],
})
export class GamificacaoModule {}
