import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContasService {
  constructor(private readonly prisma: PrismaService) {}

  async getContaById(contaId: string) {
    const conta = await this.prisma.conta.findUnique({
      where: { id: contaId },
    });
    if (!conta) throw new NotFoundException('Conta não encontrada');
    return conta;
  }

  async getContaMovimentacoes(contaId: string) {
    await this.getContaById(contaId);
    return this.prisma.movimentacao.findMany({
      where: { contaId },
    });
  }
}
