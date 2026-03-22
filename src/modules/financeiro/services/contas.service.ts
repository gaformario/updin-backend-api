import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { mapMovimentacaoToExtratoItem } from '../utils/extrato-item.mapper';

@Injectable()
export class ContasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
  ) {}

  async getContaById(userId: string, contaId: string) {
    await this.accessControlService.ensureContaAccess(userId, contaId);

    const conta = await this.prisma.conta.findUnique({
      where: { id: contaId },
      include: {
        adolescente: {
          include: {
            usuario: {
              select: {
                nome: true,
                usuario: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!conta) {
      throw new NotFoundException('Conta não encontrada');
    }

    return conta;
  }

  async getContaMovimentacoes(userId: string, contaId: string) {
    await this.accessControlService.ensureContaAccess(userId, contaId);

    const movimentacoes = await this.prisma.movimentacao.findMany({
      where: { contaId },
      orderBy: { criadoEm: 'desc' },
    });

    return movimentacoes.map(mapMovimentacaoToExtratoItem);
  }
}
