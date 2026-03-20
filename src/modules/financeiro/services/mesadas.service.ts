import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
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
      throw new BadRequestException('Somente responsáveis podem criar mesadas');
    }

    const adolescente = await this.prisma.adolescente.findUnique({
      where: { id: adolescenteId },
      select: { id: true, responsavelId: true },
    });

    if (!adolescente) {
      throw new NotFoundException('Adolescente não encontrado');
    }

    if (adolescente.responsavelId !== context.responsavelId) {
      throw new BadRequestException(
        'O adolescente informado não pertence ao responsáveis autenticado',
      );
    }

    return this.prisma.mesada.create({
      data: {
        adolescenteId,
        responsavelId: context.responsavelId,
        valor: payload.valor,
        periodicidade: payload.periodicidade,
        descricao: payload.descricao,
        dataInicio: payload.dataInicio
          ? new Date(payload.dataInicio)
          : new Date(),
        ativa: true,
      },
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
      throw new NotFoundException('Mesada não encontrada');
    }

    await this.accessControlService.ensureResponsavelAccess(
      userId,
      existing.responsavelId,
    );

    return this.prisma.mesada.update({
      where: { id: mesadaId },
      data: {
        valor: update.valor,
        periodicidade: update.periodicidade,
        ativa: update.ativa,
        descricao: update.descricao,
        dataInicio: update.dataInicio ? new Date(update.dataInicio) : undefined,
      },
    });
  }

  async getMesadaById(userId: string, mesadaId: string) {
    const mesada = await this.prisma.mesada.findUnique({
      where: { id: mesadaId },
    });

    if (!mesada) {
      throw new NotFoundException('Mesada não encontrada');
    }

    await this.accessControlService.ensureAdolescenteAccess(
      userId,
      mesada.adolescenteId,
    );

    return mesada;
  }
}
