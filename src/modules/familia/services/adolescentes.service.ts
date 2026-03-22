import { Injectable, NotFoundException } from '@nestjs/common';
import { MissaoStatus } from '@prisma/client';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

type AchievementSnapshot = {
  codigo: string;
  nome: string;
  descricao: string;
  conquistada: boolean;
};

@Injectable()
export class AdolescentesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
  ) {}

  async getAdolescenteById(userId: string, adolescenteId: string) {
    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      adolescenteId,
    );

    const adolescente = await this.prisma.adolescente.findUnique({
      where: { id: adolescenteId },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            usuario: true,
            email: true,
            ativo: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            usuario: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!adolescente) {
      throw new NotFoundException('Adolescente nao encontrado');
    }

    return adolescente;
  }

  async getAdolescenteConta(userId: string, adolescenteId: string) {
    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      adolescenteId,
    );

    const conta = await this.prisma.conta.findUnique({
      where: { adolescenteId },
      include: {
        movimentacoes: {
          orderBy: { criadoEm: 'desc' },
          take: 10,
        },
      },
    });

    if (!conta) {
      throw new NotFoundException('Conta nao encontrada');
    }

    return conta;
  }

  async getAdolescenteDashboard(userId: string, adolescenteId: string) {
    const adolescente = await this.getAdolescenteById(userId, adolescenteId);
    const conta = await this.getAdolescenteConta(userId, adolescenteId);
    const mesadas = await this.prisma.mesada.findMany({
      where: { adolescenteId },
      orderBy: { criadoEm: 'desc' },
    });

    return {
      adolescente,
      conta,
      mesadas,
      resumo: {
        saldoTotal: conta.saldoTotal,
        totalMovimentacoes: conta.movimentacoes.length,
        mesadasAtivas: mesadas.filter((mesada) => mesada.ativa).length,
      },
    };
  }

  async getAdolescenteEstatisticas(userId: string, adolescenteId: string) {
    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      adolescenteId,
    );

    const progress = await this.buildProgressSnapshot(adolescenteId);

    return {
      adolescenteId,
      missoesConcluidas: progress.missoesConcluidas,
      quizzesCompletos: progress.quizzesCompletos,
      conquistasAlcancadas: progress.conquistas.filter(
        (item) => item.conquistada,
      ).length,
      totalConquistas: progress.conquistas.length,
      xpTotal: progress.xpTotal,
    };
  }

  async getAdolescenteConquistas(userId: string, adolescenteId: string) {
    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      adolescenteId,
    );

    const progress = await this.buildProgressSnapshot(adolescenteId);

    return {
      adolescenteId,
      conquistasAlcancadas: progress.conquistas.filter(
        (item) => item.conquistada,
      ).length,
      totalConquistas: progress.conquistas.length,
      conquistas: progress.conquistas,
    };
  }

  async getAdolescenteXpSemanal(userId: string, adolescenteId: string) {
    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      adolescenteId,
    );

    const eventos = await this.prisma.pontuacaoEvento.findMany({
      where: { adolescenteId },
      select: {
        pontos: true,
        criadoEm: true,
      },
      orderBy: { criadoEm: 'asc' },
    });

    if (eventos.length === 0) {
      return {
        adolescenteId,
        xpTotal: 0,
        semanas: [],
      };
    }

    const baseDate = eventos[0].criadoEm;
    const semanalMap = new Map<
      number,
      { numero: number; inicio: Date; fim: Date; xpGanho: number }
    >();

    for (const evento of eventos) {
      const weekNumber =
        Math.floor(
          (evento.criadoEm.getTime() - baseDate.getTime()) / WEEK_IN_MS,
        ) + 1;

      if (!semanalMap.has(weekNumber)) {
        const inicio = new Date(
          baseDate.getTime() + (weekNumber - 1) * WEEK_IN_MS,
        );
        const fim = new Date(inicio.getTime() + WEEK_IN_MS - 1);

        semanalMap.set(weekNumber, {
          numero: weekNumber,
          inicio,
          fim,
          xpGanho: 0,
        });
      }

      const current = semanalMap.get(weekNumber);
      if (current) {
        current.xpGanho += evento.pontos;
      }
    }

    let xpAcumulado = 0;
    const semanas = Array.from(semanalMap.values())
      .sort((a, b) => a.numero - b.numero)
      .map((semana) => {
        xpAcumulado += semana.xpGanho;

        return {
          semana: `s${semana.numero}`,
          numero: semana.numero,
          inicio: semana.inicio.toISOString(),
          fim: semana.fim.toISOString(),
          xpGanho: semana.xpGanho,
          xpAcumulado,
        };
      });

    return {
      adolescenteId,
      xpTotal: xpAcumulado,
      semanas,
    };
  }

  async listAdolescenteNotificacoes(userId: string, adolescenteId: string) {
    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      adolescenteId,
    );

    return this.prisma.notificacao.findMany({
      where: { adolescenteId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  private async buildProgressSnapshot(adolescenteId: string) {
    const [
      missoesConcluidas,
      quizTentativas,
      mesadaHistorico,
      xpAggregate,
      ranking,
    ] = await Promise.all([
      this.prisma.missaoAtribuicao.count({
        where: {
          adolescenteId,
          status: {
            in: [MissaoStatus.concluida, MissaoStatus.validada],
          },
        },
      }),
      this.prisma.quizTentativa.findMany({
        where: { adolescenteId },
        select: {
          quizId: true,
          acertos: true,
          totalPerguntas: true,
          finalizadoEm: true,
          quiz: {
            select: {
              categoria: true,
            },
          },
        },
        orderBy: { finalizadoEm: 'asc' },
      }),
      this.prisma.mesadaHistorico.findMany({
        where: { adolescenteId },
        select: {
          valorAnterior: true,
          valorNovo: true,
        },
        orderBy: { criadoEm: 'asc' },
      }),
      this.prisma.pontuacaoEvento.aggregate({
        where: { adolescenteId },
        _sum: {
          pontos: true,
        },
      }),
      this.buildGlobalRankingSnapshot(),
    ]);

    const quizzesCompletos = new Set(
      quizTentativas.map((tentativa) => tentativa.quizId),
    ).size;
    const categoriasDiferentes = new Set(
      quizTentativas.map((tentativa) => tentativa.quiz.categoria),
    ).size;
    const quizzesPerfeitos = quizTentativas.filter(
      (tentativa) =>
        tentativa.totalPerguntas > 0 &&
        tentativa.acertos === tentativa.totalPerguntas,
    ).length;
    const teveAumentoMesada = mesadaHistorico.some(
      (item) =>
        item.valorAnterior !== null &&
        Number(item.valorNovo) > Number(item.valorAnterior),
    );
    const rankingAtual = ranking.find(
      (item) => item.adolescenteId === adolescenteId,
    );
    const xpTotal = xpAggregate._sum.pontos ?? 0;

    const conquistas = this.buildAchievements({
      missoesConcluidas,
      quizzesCompletos,
      categoriasDiferentes,
      quizzesPerfeitos,
      teveAumentoMesada,
      liderGlobal: rankingAtual?.posicao === 1,
    });

    return {
      missoesConcluidas,
      quizzesCompletos,
      xpTotal,
      conquistas,
    };
  }

  private buildAchievements(input: {
    missoesConcluidas: number;
    quizzesCompletos: number;
    categoriasDiferentes: number;
    quizzesPerfeitos: number;
    teveAumentoMesada: boolean;
    liderGlobal: boolean;
  }): AchievementSnapshot[] {
    return [
      {
        codigo: 'primeira_missao',
        nome: 'Primeira Missão',
        descricao: 'Completou a primeira missão.',
        conquistada: input.missoesConcluidas >= 1,
      },
      {
        codigo: 'poupador',
        nome: 'Poupador',
        descricao: 'Recebeu um aumento no valor da mesada.',
        conquistada: input.teveAumentoMesada,
      },
      {
        codigo: 'estudante',
        nome: 'Estudante',
        descricao: 'Completou 3 quizzes.',
        conquistada: input.quizzesCompletos >= 3,
      },
      {
        codigo: 'focado',
        nome: 'Focado',
        descricao: 'Completou quizzes de 3 categorias diferentes.',
        conquistada: input.categoriasDiferentes >= 3,
      },
      {
        codigo: 'estrela',
        nome: 'Estrela',
        descricao: 'Alcancou a primeira posicao do ranking global.',
        conquistada: input.liderGlobal,
      },
      {
        codigo: 'sequencia',
        nome: 'Sequência Perfeita',
        descricao: 'Completou 5 quizzes com 100% de acerto.',
        conquistada: input.quizzesPerfeitos >= 5,
      },
    ];
  }

  private async buildGlobalRankingSnapshot() {
    const [adolescentes, pontuacoes] = await Promise.all([
      this.prisma.adolescente.findMany({
        include: {
          usuario: {
            select: {
              nome: true,
              usuario: true,
            },
          },
        },
        orderBy: { criadoEm: 'asc' },
      }),
      this.prisma.pontuacaoEvento.groupBy({
        by: ['adolescenteId'],
        _sum: {
          pontos: true,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    const pontuacaoMap = new Map(
      pontuacoes.map((item) => [item.adolescenteId, item]),
    );

    return adolescentes
      .map((adolescente) => {
        const total = pontuacaoMap.get(adolescente.id);
        const xpTotal = total?._sum.pontos ?? 0;

        return {
          adolescenteId: adolescente.id,
          nome: adolescente.usuario.nome,
          usuario: adolescente.usuario.usuario,
          xpTotal,
          eventosPontuados: total?._count._all ?? 0,
        };
      })
      .sort((a, b) => b.xpTotal - a.xpTotal || a.nome.localeCompare(b.nome))
      .map((item, index) => ({
        posicao: index + 1,
        ...item,
      }));
  }
}

