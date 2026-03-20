import { Injectable } from '@nestjs/common';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RankingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
  ) {}

  async getGlobalRanking(userId: string) {
    await this.accessControlService.getUserContextOrFail(userId);
    return this.buildRanking();
  }

  async getRankingByResponsavel(userId: string, responsavelId: string) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );
    return this.buildRanking(responsavelId);
  }

  private async buildRanking(responsavelId?: string) {
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
      where: responsavelId
        ? {
            adolescente: {
              responsavelId,
            },
          }
        : undefined,
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

    const ranking = adolescentes
      .map((adolescente) => {
        const total = pontuacaoMap.get(adolescente.id);
        return {
          adolescenteId: adolescente.id,
          nome: adolescente.usuario.nome,
          usuario: adolescente.usuario.usuario,
          pontuacaoTotal: total?._sum.pontos ?? 0,
          eventosPontuados: total?._count._all ?? 0,
        };
      })
      .sort(
        (a, b) =>
          b.pontuacaoTotal - a.pontuacaoTotal || a.nome.localeCompare(b.nome),
      )
      .map((item, index) => ({
        posicao: index + 1,
        ...item,
      }));

    return {
      escopo: responsavelId ? 'responsavel' : 'global',
      totalParticipantes: ranking.length,
      ranking,
    };
  }
}
