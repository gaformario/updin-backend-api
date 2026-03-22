import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../../common/auth/decorators/public.decorator';
import { CurrentUser } from '../../../common/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/auth/interfaces/authenticated-request.interface';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';
import { QuizzesService } from '../services/quizzes.service';

@ApiTags('Quizzes')
@Controller()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @ApiBearerAuth()
  @Post('quizzes')
  @ApiOperation({ summary: 'Criar quiz com perguntas e alternativas' })
  async createQuiz(
    @Body() body: CreateQuizDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizzesService.createQuiz(user.userId, body);
  }

  @Public()
  @Get('quizzes')
  @ApiOperation({ summary: 'Listar quizzes publicos disponiveis' })
  async listPublic() {
    return this.quizzesService.listPublic();
  }

  @Public()
  @Get('quizzes/:quizId')
  @ApiOperation({ summary: 'Detalhar quiz publico' })
  @ApiParam({ name: 'quizId', example: 'uuid-quiz' })
  async getById(@Param('quizId') quizId: string) {
    return this.quizzesService.getQuizById(quizId);
  }

  @ApiBearerAuth()
  @Post('quizzes/:quizId/tentativas/adolescentes/:adolescenteId')
  @ApiOperation({ summary: 'Responder quiz e registrar tentativa' })
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Param('adolescenteId') adolescenteId: string,
    @Body() body: SubmitQuizDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizzesService.submitQuiz(
      user.userId,
      quizId,
      adolescenteId,
      body,
    );
  }

  @ApiBearerAuth()
  @Get('quizzes/tentativas/:tentativaId')
  @ApiOperation({ summary: 'Detalhar tentativa de quiz' })
  async getTentativa(
    @Param('tentativaId') tentativaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizzesService.getTentativaById(user.userId, tentativaId);
  }
}
