import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    nome: string,
    usuario: string,
    email: string,
    senhaHash: string,
    tipo: 'responsavel' | 'adolescente',
    cpf?: string,
    telefone?: string,
  ) {
    if (tipo !== 'responsavel') {
      throw new BadRequestException(
        'Cadastro deve ser feito por responsável. Adolescentes usam login.',
      );
    }

    const existingUser = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ usuario }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new BadRequestException('Email já está em uso');
      }
      throw new BadRequestException('Usuário de login já está em uso');
    }

    const user = await this.prisma.usuario.create({
      data: {
        nome,
        usuario,
        email,
        senhaHash: senhaHash,
        tipo,
        ativo: true,
      },
    });

    await this.prisma.responsavel.create({
      data: {
        usuarioId: user.id,
        cpf,
        telefone,
      },
    });

    return user;
  }

  async login(login: string, senhaHash: string) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ usuario: login }, { email: login }],
      },
    });

    if (!user || user.senhaHash !== senhaHash) {
      throw new BadRequestException('Credenciais inválidas');
    }

    return { token: `fake-token-${user.id}`, user };
  }

  async getMe(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }
}
