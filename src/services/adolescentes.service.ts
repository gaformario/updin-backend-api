import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdolescentesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdolescenteById(adolescenteId: string) {
    const adolescente = await this.prisma.adolescente.findUnique({
      where: { id: adolescenteId },
    });
    if (!adolescente) throw new NotFoundException('Adolescente não encontrado');
    return adolescente;
  }

  async getAdolescenteConta(adolescenteId: string) {
    const conta = await this.prisma.conta.findFirst({
      where: { adolescenteId },
    });
    if (!conta) throw new NotFoundException('Conta não encontrada');
    return conta;
  }

  async getAdolescenteMesadas(adolescenteId: string) {
    return this.prisma.mesada.findMany({
      where: { adolescenteId },
    });
  }

  async getAdolescenteDashboard(adolescenteId: string) {
    const adolescente = await this.getAdolescenteById(adolescenteId);
    const conta = await this.getAdolescenteConta(adolescenteId);
    const mesadas = await this.getAdolescenteMesadas(adolescenteId);
    const movimentacoes = await this.prisma.movimentacao.findMany({
      where: { contaId: conta.id },
    });
    return {
      adolescente,
      conta,
      mesadas,
      movimentacoes,
    };
  }
}
