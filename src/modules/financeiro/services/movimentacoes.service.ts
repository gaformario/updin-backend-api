import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserType } from '@prisma/client';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMovimentacaoDto } from '../dto/create-movimentacao.dto';
import { mapMovimentacaoToExtratoItem } from '../utils/extrato-item.mapper';

@Injectable()
export class MovimentacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
  ) {}

  async createMovimentacao(
    userId: string,
    contaId: string,
    payload: CreateMovimentacaoDto,
  ) {
    const context =
      await this.accessControlService.getUserContextOrFail(userId);
    await this.accessControlService.ensureContaAccess(userId, contaId);
    this.validateMovimentacaoByActor(context.tipo, payload);

    return this.prisma.$transaction(async (tx) => {
      const conta = await tx.conta.findUnique({
        where: { id: contaId },
      });

      if (!conta) {
        throw new NotFoundException('Conta não encontrada');
      }

      const valor = new Prisma.Decimal(payload.valor);
      const saldoAtual = new Prisma.Decimal(conta.saldoTotal);
      const novoSaldo =
        payload.tipo === 'credito'
          ? saldoAtual.plus(valor)
          : saldoAtual.minus(valor);

      if (payload.tipo === 'debito' && novoSaldo.isNegative()) {
        throw new BadRequestException('Saldo insuficiente para essa operacão');
      }

      const movimentacao = await tx.movimentacao.create({
        data: {
          contaId,
          tipo: payload.tipo,
          origem: payload.origem,
          valor,
          descricao: payload.descricao,
          saldoApos: novoSaldo,
        },
      });

      await tx.conta.update({
        where: { id: contaId },
        data: {
          saldoTotal: novoSaldo,
        },
      });

      return movimentacao;
    });
  }

  async getMovimentacaoById(userId: string, movimentacaoId: string) {
    const mov = await this.prisma.movimentacao.findUnique({
      where: { id: movimentacaoId },
    });

    if (!mov) {
      throw new NotFoundException('Movimentação não encontrada');
    }

    await this.accessControlService.ensureContaAccess(userId, mov.contaId);

    return mapMovimentacaoToExtratoItem(mov);
  }

  private validateMovimentacaoByActor(
    tipoUsuario: UserType,
    payload: CreateMovimentacaoDto,
  ) {
    if (payload.origem === 'mesada' && payload.tipo !== 'credito') {
      throw new BadRequestException('Movimentação de mesada deve ser credito');
    }

    if (payload.origem === 'gasto' && payload.tipo !== 'debito') {
      throw new BadRequestException('Movimentação de gasto deve ser debito');
    }

    if (payload.origem === 'recompensa' && payload.tipo !== 'credito') {
      throw new BadRequestException(
        'Movimentação de recompensa deve ser credito',
      );
    }

    if (tipoUsuario === UserType.adolescente) {
      const adolescentePodeCriar =
        payload.tipo === 'debito' && payload.origem === 'gasto';

      if (!adolescentePodeCriar) {
        throw new BadRequestException(
          'Adolescentes so podem registrar gastos em debito',
        );
      }
    }
  }
}
