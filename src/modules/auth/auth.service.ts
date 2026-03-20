import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterResponsavelDto } from './dto/register-responsavel.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async registerResponsavel(payload: RegisterResponsavelDto) {
    await this.ensureUniqueUserFields(
      payload.usuario,
      payload.email,
      payload.cpf,
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: {
          nome: payload.nome,
          usuario: payload.usuario,
          email: payload.email,
          senhaHash: this.passwordService.hashPassword(payload.senha),
          tipo: UserType.responsavel,
        },
      });

      const responsavel = await tx.responsavel.create({
        data: {
          usuarioId: user.id,
          cpf: payload.cpf,
          telefone: payload.telefone,
        },
      });

      return { user, responsavel };
    });

    return {
      usuario: this.toSafeUser(created.user),
      responsavel: created.responsavel,
    };
  }

  async login(payload: LoginDto) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ usuario: payload.login }, { email: payload.login }],
      },
      include: {
        responsavel: { select: { id: true } },
        adolescente: { select: { id: true } },
      },
    });

    if (
      !user ||
      !this.passwordService.verifyPassword(payload.senha, user.senhaHash)
    ) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    return {
      token: this.tokenService.signToken({
        userId: user.id,
        tipo: user.tipo,
      }),
      usuario: this.toSafeUser(user),
      perfis: {
        responsavelId: user.responsavel?.id,
        adolescenteId: user.adolescente?.id,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        responsavel: {
          select: { id: true, telefone: true, cpf: true },
        },
        adolescente: {
          select: {
            id: true,
            responsavelId: true,
            telefone: true,
            dataNascimento: true,
            cpf: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return {
      ...this.toSafeUser(user),
      perfis: {
        responsavel: user.responsavel,
        adolescente: user.adolescente,
      },
    };
  }

  private async ensureUniqueUserFields(
    usuario: string,
    email: string,
    cpf?: string,
  ) {
    const existingUser = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ usuario }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new BadRequestException('Email ja esta em uso');
      }

      throw new BadRequestException('Usuario de login ja esta em uso');
    }

    if (cpf) {
      const existingCpf = await this.prisma.responsavel.findFirst({
        where: { cpf },
      });

      if (existingCpf) {
        throw new BadRequestException('CPF ja esta em uso');
      }
    }
  }

  private toSafeUser(user: {
    id: string;
    nome: string;
    usuario: string;
    email: string | null;
    tipo: UserType;
    ativo: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
  }) {
    return {
      id: user.id,
      nome: user.nome,
      usuario: user.usuario,
      email: user.email,
      tipo: user.tipo,
      ativo: user.ativo,
      criadoEm: user.criadoEm,
      atualizadoEm: user.atualizadoEm,
    };
  }
}
