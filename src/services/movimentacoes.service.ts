import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MovimentacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async createMovimentacao(payload: {
    contaId: string;
    tipo: 'credito' | 'debito';
    origem: 'mesada' | 'ajuste_manual' | 'gasto';
    valor: number;
    descricao?: string;
  }) {
    const conta = await this.prisma.conta.findUnique({
      where: { id: payload.contaId },
    });
    if (!conta) throw new NotFoundException('Conta não encontrada');

    const movimentacao = await this.prisma.movimentacao.create({
      data: {
        contaId: payload.contaId,
        tipo: payload.tipo,
        origem: payload.origem,
        valor: payload.valor,
        descricao: payload.descricao,
      },
    });

    await this.prisma.conta.update({
      where: { id: payload.contaId },
      data: {
        saldoTotal:
          payload.tipo === 'credito'
            ? conta.saldoTotal + payload.valor
            : conta.saldoTotal - payload.valor,
      },
    });

    return movimentacao;
  }

  async getMovimentacaoById(movimentacaoId: string) {
    const mov = await this.prisma.movimentacao.findUnique({
      where: { id: movimentacaoId },
    });
    if (!mov) throw new NotFoundException('Movimentação não encontrada');
    return mov;
  }
}
