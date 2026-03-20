import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MissaoStatus,
  OrigemPontuacao,
  Prisma,
  UserType,
} from '@prisma/client';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssignMissaoDto } from '../dto/assign-missao.dto';
import { CompleteMissaoDto } from '../dto/complete-missao.dto';
import { CreateMissaoDto } from '../dto/create-missao.dto';
import { ValidateMissaoDto } from '../dto/validate-missao.dto';

@Injectable()
export class MissoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
  ) {}

  async createMissao(
    userId: string,
    responsavelId: string,
    payload: CreateMissaoDto,
  ) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );

    return this.prisma.missao.create({
      data: {
        responsavelId,
        titulo: payload.titulo,
        descricao: payload.descricao,
        pontos: payload.pontos,
        recompensaFinanceira:
          payload.recompensaFinanceira !== undefined
            ? new Prisma.Decimal(payload.recompensaFinanceira)
            : undefined,
        ativa: payload.ativa ?? true,
      },
    });
  }

  async listMissoesByResponsavel(userId: string, responsavelId: string) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );

    return this.prisma.missao.findMany({
      where: { responsavelId },
      include: {
        atribuicoes: {
          include: {
            adolescente: {
              include: {
                usuario: {
                  select: { nome: true, usuario: true },
                },
              },
            },
          },
          orderBy: { criadoEm: 'desc' },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async assignMissao(
    userId: string,
    missaoId: string,
    payload: AssignMissaoDto,
  ) {
    const missao = await this.prisma.missao.findUnique({
      where: { id: missaoId },
    });

    if (!missao) {
      throw new NotFoundException('Missão não encontrada');
    }

    await this.accessControlService.ensureResponsavelAccess(
      userId,
      missao.responsavelId,
    );
    await this.ensureAdolescenteBelongsToResponsavel(
      payload.adolescenteId,
      missao.responsavelId,
    );

    const existing = await this.prisma.missaoAtribuicao.findFirst({
      where: {
        missaoId,
        adolescenteId: payload.adolescenteId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Missão ja atribuida para esse adolescente',
      );
    }

    return this.prisma.missaoAtribuicao.create({
      data: {
        missaoId,
        adolescenteId: payload.adolescenteId,
        dataLimite: payload.dataLimite
          ? new Date(payload.dataLimite)
          : undefined,
        observacao: payload.observacao,
      },
      include: {
        missao: true,
        adolescente: {
          include: {
            usuario: {
              select: { nome: true, usuario: true },
            },
          },
        },
      },
    });
  }

  async listMissoesByAdolescente(userId: string, adolescenteId: string) {
    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      adolescenteId,
    );

    return this.prisma.missaoAtribuicao.findMany({
      where: { adolescenteId },
      include: {
        missao: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async getAtribuicao(userId: string, atribuicaoId: string) {
    const atribuicao = await this.prisma.missaoAtribuicao.findUnique({
      where: { id: atribuicaoId },
      include: {
        missao: true,
        adolescente: {
          include: {
            usuario: { select: { nome: true, usuario: true } },
          },
        },
      },
    });

    if (!atribuicao) {
      throw new NotFoundException('Atribuicao de missão nao encontrada');
    }

    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      atribuicao.adolescenteId,
    );

    return atribuicao;
  }

  async completeMissao(
    userId: string,
    atribuicaoId: string,
    payload: CompleteMissaoDto,
  ) {
    const atribuicao = await this.prisma.missaoAtribuicao.findUnique({
      where: { id: atribuicaoId },
    });

    if (!atribuicao) {
      throw new NotFoundException('Atribuicao de missão nao encontrada');
    }

    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      atribuicao.adolescenteId,
    );

    if (atribuicao.status === MissaoStatus.validada) {
      throw new BadRequestException('Missão já validada');
    }

    return this.prisma.missaoAtribuicao.update({
      where: { id: atribuicaoId },
      data: {
        status: MissaoStatus.concluida,
        concluidaEm: new Date(),
        observacao: payload.observacao ?? atribuicao.observacao,
      },
    });
  }

  async validateMissao(
    userId: string,
    atribuicaoId: string,
    payload: ValidateMissaoDto,
  ) {
    const context =
      await this.accessControlService.getUserContextOrFail(userId);

    if (context.tipo !== UserType.responsavel || !context.responsavelId) {
      throw new BadRequestException(
        'Somente responsáveis podem validar missões',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const atribuicao = await tx.missaoAtribuicao.findUnique({
        where: { id: atribuicaoId },
        include: {
          missao: true,
          adolescente: {
            include: {
              conta: true,
            },
          },
        },
      });

      if (!atribuicao) {
        throw new NotFoundException('Atribuicao de missão nao encontrada');
      }

      if (atribuicao.missao.responsavelId !== context.responsavelId) {
        throw new BadRequestException(
          'Missão não pertence ao responsável autenticado',
        );
      }

      if (atribuicao.status !== MissaoStatus.concluida) {
        throw new BadRequestException(
          'Somente missões concluídas podem ser validadas',
        );
      }

      const updated = await tx.missaoAtribuicao.update({
        where: { id: atribuicaoId },
        data: {
          status: MissaoStatus.validada,
          validadaEm: new Date(),
          validadaPorResponsavelId: context.responsavelId,
          observacao: payload.observacao ?? atribuicao.observacao,
        },
      });

      await tx.pontuacaoEvento.create({
        data: {
          adolescenteId: atribuicao.adolescenteId,
          origemTipo: OrigemPontuacao.missao,
          origemId: atribuicao.id,
          pontos: atribuicao.missao.pontos,
          descricao: `Missão validada: ${atribuicao.missao.titulo}`,
        },
      });

      if (
        atribuicao.missao.recompensaFinanceira &&
        atribuicao.adolescente.conta
      ) {
        const novoSaldo = new Prisma.Decimal(
          atribuicao.adolescente.conta.saldoTotal,
        ).plus(atribuicao.missao.recompensaFinanceira);

        await tx.movimentacao.create({
          data: {
            contaId: atribuicao.adolescente.conta.id,
            tipo: 'credito',
            origem: 'recompensa',
            valor: atribuicao.missao.recompensaFinanceira,
            descricao: `${atribuicao.missao.titulo}`,
            saldoApos: novoSaldo,
          },
        });

        await tx.conta.update({
          where: { id: atribuicao.adolescente.conta.id },
          data: { saldoTotal: novoSaldo },
        });
      }

      return updated;
    });
  }

  private async ensureAdolescenteBelongsToResponsavel(
    adolescenteId: string,
    responsavelId: string,
  ) {
    const adolescente = await this.prisma.adolescente.findUnique({
      where: { id: adolescenteId },
      select: { responsavelId: true },
    });

    if (!adolescente) {
      throw new NotFoundException('Adolescente não encontrado');
    }

    if (adolescente.responsavelId !== responsavelId) {
      throw new BadRequestException(
        'O adolescente informado não pertence ao responsável autenticado',
      );
    }
  }
}
