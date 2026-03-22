import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserType } from '@prisma/client';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMesadaDto } from '../dto/create-mesada.dto';
import { UpdateMesadaDto } from '../dto/update-mesada.dto';

@Injectable()
export class MesadasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
  ) {}

  async createMesada(
    userId: string,
    adolescenteId: string,
    payload: CreateMesadaDto,
  ) {
    const context =
      await this.accessControlService.getUserContextOrFail(userId);

    if (context.tipo !== UserType.responsavel || !context.responsavelId) {
      throw new BadRequestException('Somente responsaveis podem criar mesadas');
    }

    const responsavelId = context.responsavelId;

    const adolescente = await this.prisma.adolescente.findUnique({
      where: { id: adolescenteId },
      select: { id: true, responsavelId: true },
    });

    if (!adolescente) {
      throw new NotFoundException('Adolescente nao encontrado');
    }

    if (adolescente.responsavelId !== responsavelId) {
      throw new BadRequestException(
        'O adolescente informado nao pertence ao responsavel autenticado',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const mesada = await tx.mesada.create({
        data: {
          adolescenteId,
          responsavelId,
          valor: payload.valor,
          periodicidade: payload.periodicidade,
          descricao: payload.descricao,
          dataInicio: payload.dataInicio
            ? new Date(payload.dataInicio)
            : new Date(),
          ativa: true,
        },
      });

      await tx.mesadaHistorico.create({
        data: {
          mesadaId: mesada.id,
          adolescenteId,
          valorNovo: new Prisma.Decimal(payload.valor),
        },
      });

      return mesada;
    });
  }

  async listByAdolescente(userId: string, adolescenteId: string) {
    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      adolescenteId,
    );

    return this.prisma.mesada.findMany({
      where: { adolescenteId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async updateMesada(
    userId: string,
    mesadaId: string,
    update: UpdateMesadaDto,
  ) {
    const existing = await this.prisma.mesada.findUnique({
      where: { id: mesadaId },
    });

    if (!existing) {
      throw new NotFoundException('Mesada nao encontrada');
    }

    await this.accessControlService.ensureResponsavelAccess(
      userId,
      existing.responsavelId,
    );

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.mesada.update({
        where: { id: mesadaId },
        data: {
          valor: update.valor,
          periodicidade: update.periodicidade,
          ativa: update.ativa,
          descricao: update.descricao,
          dataInicio: update.dataInicio
            ? new Date(update.dataInicio)
            : undefined,
        },
      });

      if (
        update.valor !== undefined &&
        Number(existing.valor) !== Number(update.valor)
      ) {
        await tx.mesadaHistorico.create({
          data: {
            mesadaId: existing.id,
            adolescenteId: existing.adolescenteId,
            valorAnterior: new Prisma.Decimal(existing.valor),
            valorNovo: new Prisma.Decimal(update.valor),
          },
        });
      }

      return updated;
    });
  }

  async getMesadaById(userId: string, mesadaId: string) {
    const mesada = await this.prisma.mesada.findUnique({
      where: { id: mesadaId },
    });

    if (!mesada) {
      throw new NotFoundException('Mesada nao encontrada');
    }

    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      mesada.adolescenteId,
    );

    return mesada;
  }
}
