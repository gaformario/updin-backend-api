import { Injectable } from '@nestjs/common';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';

type RankingPeriodo = 'geral' | 'semanal' | 'mensal';

@Injectable()
export class RankingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
  ) {}

  async getGlobalRanking(userId: string) {
    await this.accessControlService.getUserContextOrFail(userId);
    return this.buildRanking(undefined, 'geral');
  }

  async getGlobalWeeklyRanking(userId: string) {
    await this.accessControlService.getUserContextOrFail(userId);
    return this.buildRanking(undefined, 'semanal');
  }

  async getGlobalMonthlyRanking(userId: string) {
    await this.accessControlService.getUserContextOrFail(userId);
    return this.buildRanking(undefined, 'mensal');
  }

  async getRankingByResponsavel(userId: string, responsavelId: string) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );
    return this.buildRanking(responsavelId, 'geral');
  }

  async getWeeklyRankingByResponsavel(userId: string, responsavelId: string) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );
    return this.buildRanking(responsavelId, 'semanal');
  }

  async getMonthlyRankingByResponsavel(userId: string, responsavelId: string) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );
    return this.buildRanking(responsavelId, 'mensal');
  }

  private async buildRanking(
    responsavelId?: string,
    periodo: RankingPeriodo = 'geral',
  ) {
    const periodoInicio = this.getPeriodoInicio(periodo);
    const periodoFim = new Date();

    const adolescentes = await this.prisma.adolescente.findMany({
      where: responsavelId ? { responsavelId } : undefined,
      include: {
        usuario: {
          select: {
            nome: true,
            usuario: true,
          },
        },
      },
      orderBy: { criadoEm: 'asc' },
    });

    const pontuacoes = await this.prisma.pontuacaoEvento.groupBy({
      by: ['adolescenteId'],
      where: {
        ...(responsavelId
          ? {
              adolescente: {
                responsavelId,
              },
            }
          : {}),
        ...(periodoInicio
          ? {
              criadoEm: {
                gte: periodoInicio,
                lte: periodoFim,
              },
            }
          : {}),
      },
      _sum: {
        pontos: true,
      },
      _count: {
        _all: true,
      },
    });

    const pontuacaoMap = new Map(
      pontuacoes.map((item) => [item.adolescenteId, item]),
    );

    const classificacaoCompleta = adolescentes
      .map((adolescente) => {
        const total = pontuacaoMap.get(adolescente.id);
        const xpTotal = total?._sum.pontos ?? 0;

        return {
          adolescenteId: adolescente.id,
          nome: adolescente.usuario.nome,
          usuario: adolescente.usuario.usuario,
          xpTotal,
          pontuacaoTotal: xpTotal,
          eventosPontuados: total?._count._all ?? 0,
        };
      })
      .sort((a, b) => b.xpTotal - a.xpTotal || a.nome.localeCompare(b.nome))
      .map((item, index) => ({
        posicao: index + 1,
        ...item,
      }));

    return {
      escopo: responsavelId ? 'responsavel' : 'global',
      criterio: 'xp_total',
      periodo,
      periodoInicio: periodoInicio?.toISOString() ?? null,
      periodoFim: periodo !== 'geral' ? periodoFim.toISOString() : null,
      totalParticipantes: classificacaoCompleta.length,
      top3: classificacaoCompleta.slice(0, 3),
      classificacaoCompleta,
      ranking: classificacaoCompleta,
    };
  }

  private getPeriodoInicio(periodo: RankingPeriodo) {
    if (periodo === 'geral') {
      return undefined;
    }

    const now = new Date();

    if (periodo === 'mensal') {
      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    const inicioSemana = new Date(now);
    const diaSemana = inicioSemana.getDay();
    const diasDesdeSegunda = diaSemana === 0 ? 6 : diaSemana - 1;

    inicioSemana.setDate(inicioSemana.getDate() - diasDesdeSegunda);
    inicioSemana.setHours(0, 0, 0, 0);

    return inicioSemana;
  }
}
