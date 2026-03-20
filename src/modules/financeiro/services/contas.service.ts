import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';

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

    return this.prisma.movimentacao.findMany({
      where: { contaId },
      orderBy: { criadoEm: 'desc' },
    });
  }
}
