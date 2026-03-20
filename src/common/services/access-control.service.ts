import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface UserContext {
  userId: string;
  tipo: UserType;
  responsavelId?: string;
  adolescenteId?: string;
}

@Injectable()
export class AccessControlService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserContextOrFail(userId: string): Promise<UserContext> {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        responsavel: true,
        adolescente: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return {
      userId: user.id,
      tipo: user.tipo,
      responsavelId: user.responsavel?.id,
      adolescenteId: user.adolescente?.id,
    };
  }

  async ensureResponsavelAccess(userId: string, responsavelId: string) {
    const context = await this.getUserContextOrFail(userId);

    if (
      context.tipo !== UserType.responsavel ||
      context.responsavelId !== responsavelId
    ) {
      throw new ForbiddenException(
        'Acesso restrito ao responsavel dono do recurso',
      );
    }

    return context;
  }

  async ensureAdolescenteAccess(userId: string, adolescenteId: string) {
    const context = await this.getUserContextOrFail(userId);

    if (context.tipo === UserType.adolescente) {
      if (context.adolescenteId !== adolescenteId) {
        throw new ForbiddenException('Acesso restrito ao proprio adolescente');
      }

      return context;
    }

    const adolescente = await this.prisma.adolescente.findUnique({
      where: { id: adolescenteId },
      select: { id: true, responsavelId: true },
    });

    if (!adolescente) {
      throw new NotFoundException('Adolescente nao encontrado');
    }

    if (context.responsavelId !== adolescente.responsavelId) {
      throw new ForbiddenException('Acesso restrito ao responsavel vinculado');
    }

    return context;
  }

  async ensureContaAccess(userId: string, contaId: string) {
    const conta = await this.prisma.conta.findUnique({
      where: { id: contaId },
      select: { id: true, adolescenteId: true },
    });

    if (!conta) {
      throw new NotFoundException('Conta nao encontrada');
    }

    await this.ensureAdolescenteAccess(userId, conta.adolescenteId);

    return conta;
  }
}
