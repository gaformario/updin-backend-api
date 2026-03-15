import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MesadasService {
  constructor(private readonly prisma: PrismaService) {}

  async createMesada(payload: {
    adolescenteId: string;
    responsavelId: string;
    valor: number;
    periodicidade: 'semanal' | 'quinzenal' | 'mensal';
  }) {
    const created = await this.prisma.mesada.create({
      data: {
        adolescenteId: payload.adolescenteId,
        responsavelId: payload.responsavelId,
        valor: payload.valor,
        periodicidade: payload.periodicidade,
        ativa: true,
      },
    });
    return created;
  }

  async updateMesada(
    mesadaId: string,
    update: {
      valor?: number;
      periodicidade?: 'semanal' | 'quinzenal' | 'mensal';
      ativa?: boolean;
    },
  ) {
    const existing = await this.prisma.mesada.findUnique({
      where: { id: mesadaId },
    });
    if (!existing) throw new NotFoundException('Mesada não encontrada');

    return this.prisma.mesada.update({
      where: { id: mesadaId },
      data: update,
    });
  }

  async getMesadaById(mesadaId: string) {
    const found = await this.prisma.mesada.findUnique({
      where: { id: mesadaId },
    });
    if (!found) throw new NotFoundException('Mesada não encontrada');
    return found;
  }
}
