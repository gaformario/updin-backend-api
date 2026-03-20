import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';

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
      throw new NotFoundException('Adolescente não encontrado');
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
      throw new NotFoundException('Conta não encontrada');
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
}
