import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrigemPontuacao, UserType } from '@prisma/client';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
  ) {}

  async createQuiz(
    userId: string,
    responsavelId: string,
    payload: CreateQuizDto,
  ) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );
    this.validateQuizPayload(payload);

    return this.prisma.quiz.create({
      data: {
        responsavelId,
        titulo: payload.titulo,
        descricao: payload.descricao,
        perguntas: {
          create: payload.perguntas.map((pergunta) => ({
            enunciado: pergunta.enunciado,
            ordem: pergunta.ordem,
            alternativas: {
              create: pergunta.alternativas.map((alternativa) => ({
                texto: alternativa.texto,
                correta: alternativa.correta,
              })),
            },
          })),
        },
      },
      include: {
        perguntas: {
          include: {
            alternativas: true,
          },
          orderBy: { ordem: 'asc' },
        },
      },
    });
  }

  async listByResponsavel(userId: string, responsavelId: string) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );

    return this.prisma.quiz.findMany({
      where: { responsavelId },
      include: {
        perguntas: {
          include: {
            alternativas: true,
          },
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async listByAdolescente(userId: string, adolescenteId: string) {
    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      adolescenteId,
    );

    const adolescente = await this.prisma.adolescente.findUnique({
      where: { id: adolescenteId },
      select: { responsavelId: true },
    });

    if (!adolescente) {
      throw new NotFoundException('Adolescente não encontrado');
    }

    const quizzes = await this.prisma.quiz.findMany({
      where: {
        responsavelId: adolescente.responsavelId,
        ativo: true,
      },
      include: {
        perguntas: {
          include: {
            alternativas: {
              select: {
                id: true,
                texto: true,
              },
            },
          },
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });

    return quizzes;
  }

  async getQuizById(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        perguntas: {
          include: {
            alternativas: true,
          },
          orderBy: { ordem: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz não encontrado');
    }

    const context =
      await this.accessControlService.getUserContextOrFail(userId);

    if (context.tipo === UserType.responsavel) {
      await this.accessControlService.ensureResponsavelAccess(
        userId,
        quiz.responsavelId,
      );
      return quiz;
    }

    if (!context.adolescenteId) {
      throw new BadRequestException('Usuário adolescente inválido');
    }

    const adolescente = await this.prisma.adolescente.findUnique({
      where: { id: context.adolescenteId },
      select: { responsavelId: true },
    });

    if (!adolescente || adolescente.responsavelId !== quiz.responsavelId) {
      throw new BadRequestException(
        'Quiz não disponível para este adolescente',
      );
    }

    return {
      ...quiz,
      perguntas: quiz.perguntas.map((pergunta) => ({
        ...pergunta,
        alternativas: pergunta.alternativas.map((alternativa) => ({
          id: alternativa.id,
          texto: alternativa.texto,
        })),
      })),
    };
  }

  async submitQuiz(
    userId: string,
    quizId: string,
    adolescenteId: string,
    payload: SubmitQuizDto,
  ) {
    const context =
      await this.accessControlService.getUserContextOrFail(userId);
    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      adolescenteId,
    );

    if (
      context.tipo === UserType.adolescente &&
      context.adolescenteId !== adolescenteId
    ) {
      throw new BadRequestException(
        'Tentativa invalida para o adolescente autenticado',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.findUnique({
        where: { id: quizId },
        include: {
          perguntas: {
            include: {
              alternativas: true,
            },
            orderBy: { ordem: 'asc' },
          },
        },
      });

      if (!quiz || !quiz.ativo) {
        throw new NotFoundException('Quiz não encontrado ou inativo');
      }

      const adolescente = await tx.adolescente.findUnique({
        where: { id: adolescenteId },
        select: { responsavelId: true },
      });

      if (!adolescente || adolescente.responsavelId !== quiz.responsavelId) {
        throw new BadRequestException(
          'Quiz não disponível para este adolescente',
        );
      }

      if (payload.respostas.length !== quiz.perguntas.length) {
        throw new BadRequestException(
          'Todas as perguntas precisam ser respondidas',
        );
      }

      const perguntaMap = new Map(
        quiz.perguntas.map((pergunta) => [pergunta.id, pergunta]),
      );
      let acertos = 0;

      for (const resposta of payload.respostas) {
        const pergunta = perguntaMap.get(resposta.perguntaId);

        if (!pergunta) {
          throw new BadRequestException(
            'Pergunta informada nao pertence ao quiz',
          );
        }

        const alternativa = pergunta.alternativas.find(
          (item) => item.id === resposta.alternativaId,
        );

        if (!alternativa) {
          throw new BadRequestException(
            'Alternativa informada nao pertence a pergunta',
          );
        }

        if (alternativa.correta) {
          acertos += 1;
        }
      }

      const pontuacao = acertos * 10;

      const tentativa = await tx.quizTentativa.create({
        data: {
          quizId,
          adolescenteId,
          pontuacao,
          acertos,
          totalPerguntas: quiz.perguntas.length,
          respostas: {
            create: payload.respostas.map((resposta) => ({
              perguntaId: resposta.perguntaId,
              alternativaId: resposta.alternativaId,
              correta: Boolean(
                perguntaMap
                  .get(resposta.perguntaId)
                  ?.alternativas.find(
                    (item) => item.id === resposta.alternativaId,
                  )?.correta,
              ),
            })),
          },
        },
        include: {
          respostas: true,
        },
      });

      await tx.pontuacaoEvento.create({
        data: {
          adolescenteId,
          origemTipo: OrigemPontuacao.quiz,
          origemId: tentativa.id,
          pontos: tentativa.pontuacao,
          descricao: `Quiz respondido: ${quiz.titulo}`,
        },
      });

      return tentativa;
    });
  }

  async getTentativaById(userId: string, tentativaId: string) {
    const tentativa = await this.prisma.quizTentativa.findUnique({
      where: { id: tentativaId },
      include: {
        quiz: {
          select: {
            id: true,
            titulo: true,
            responsavelId: true,
          },
        },
        respostas: true,
      },
    });

    if (!tentativa) {
      throw new NotFoundException('Tentativa nao encontrada');
    }

    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      tentativa.adolescenteId,
    );

    return tentativa;
  }

  private validateQuizPayload(payload: CreateQuizDto) {
    const ordens = new Set<number>();

    for (const pergunta of payload.perguntas) {
      if (ordens.has(pergunta.ordem)) {
        throw new BadRequestException(
          'As perguntas do quiz precisam ter ordem unica',
        );
      }

      ordens.add(pergunta.ordem);

      const corretas = pergunta.alternativas.filter(
        (item) => item.correta,
      ).length;

      if (corretas !== 1) {
        throw new BadRequestException(
          'Cada pergunta precisa ter exatamente uma alternativa correta',
        );
      }
    }
  }
}
