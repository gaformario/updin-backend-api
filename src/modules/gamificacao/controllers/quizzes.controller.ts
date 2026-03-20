import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/auth/interfaces/authenticated-request.interface';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';
import { QuizzesService } from '../services/quizzes.service';

@ApiTags('Quizzes')
@ApiBearerAuth()
@Controller()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post('responsaveis/:responsavelId/quizzes')
  @ApiOperation({ summary: 'Criar quiz com perguntas e alternativas' })
  async createQuiz(
    @Param('responsavelId') responsavelId: string,
    @Body() body: CreateQuizDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizzesService.createQuiz(user.userId, responsavelId, body);
  }

  @Get('responsaveis/:responsavelId/quizzes')
  @ApiOperation({ summary: 'Listar quizzes do responsavel' })
  async listByResponsavel(
    @Param('responsavelId') responsavelId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizzesService.listByResponsavel(user.userId, responsavelId);
  }

  @Get('adolescentes/:adolescenteId/quizzes')
  @ApiOperation({ summary: 'Listar quizzes disponiveis para o adolescente' })
  async listByAdolescente(
    @Param('adolescenteId') adolescenteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizzesService.listByAdolescente(user.userId, adolescenteId);
  }

  @Get('quizzes/:quizId')
  @ApiOperation({ summary: 'Detalhar quiz' })
  @ApiParam({ name: 'quizId', example: 'uuid-quiz' })
  async getById(
    @Param('quizId') quizId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizzesService.getQuizById(user.userId, quizId);
  }

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

  @Get('quizzes/tentativas/:tentativaId')
  @ApiOperation({ summary: 'Detalhar tentativa de quiz' })
  async getTentativa(
    @Param('tentativaId') tentativaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizzesService.getTentativaById(user.userId, tentativaId);
  }
}
