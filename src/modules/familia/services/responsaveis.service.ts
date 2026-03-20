import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccessControlService } from '../../../common/services/access-control.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PasswordService } from '../../auth/password.service';
import { CreateAdolescenteDto } from '../dto/create-adolescente.dto';

@Injectable()
export class ResponsaveisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
    private readonly passwordService: PasswordService,
  ) {}

  async findMine(userId: string) {
    const context =
      await this.accessControlService.getUserContextOrFail(userId);

    if (!context.responsavelId) {
      throw new NotFoundException(
        'Responsável não encontrado para este usuário',
      );
    }

    return this.findById(userId, context.responsavelId);
  }

  async findById(userId: string, responsavelId: string) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );

    const responsavel = await this.prisma.responsavel.findUnique({
      where: { id: responsavelId },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            usuario: true,
            email: true,
            ativo: true,
          },
        },
      },
    });

    if (!responsavel) {
      throw new NotFoundException('Responsável não encontrado');
    }

    return responsavel;
  }

  async findAdolescentesByUser(userId: string) {
    const context =
      await this.accessControlService.getUserContextOrFail(userId);

    if (!context.responsavelId) {
      throw new NotFoundException(
        'Responsável não encontrado para este usuário',
      );
    }

    return this.findAdolescentesByResponsavelId(userId, context.responsavelId);
  }

  async findAdolescentesByResponsavelId(userId: string, responsavelId: string) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );

    return this.prisma.adolescente.findMany({
      where: { responsavelId },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            usuario: true,
            email: true,
            ativo: true,
          },
        },
        conta: {
          select: {
            id: true,
            saldoTotal: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'asc',
      },
    });
  }

  async createAdolescente(
    userId: string,
    responsavelId: string,
    body: CreateAdolescenteDto,
  ) {
    await this.accessControlService.ensureResponsavelAccess(
      userId,
      responsavelId,
    );

    await this.ensureUniqueAdolescenteFields(
      body.usuario,
      body.email,
      body.cpf,
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const novoUsuario = await tx.usuario.create({
        data: {
          nome: body.nome,
          usuario: body.usuario,
          email: body.email,
          senhaHash: this.passwordService.hashPassword(body.senha),
          tipo: 'adolescente',
          ativo: true,
        },
      });

      const adolescente = await tx.adolescente.create({
        data: {
          usuarioId: novoUsuario.id,
          responsavelId,
          cpf: body.cpf,
          telefone: body.telefone,
          dataNascimento: new Date(body.dataNascimento),
        },
      });

      const conta = await tx.conta.create({
        data: {
          adolescenteId: adolescente.id,
        },
      });

      return { novoUsuario, adolescente, conta };
    });

    return {
      mensagem: 'Adolescente cadastrado com sucesso',
      usuario: {
        id: created.novoUsuario.id,
        nome: created.novoUsuario.nome,
        usuario: created.novoUsuario.usuario,
        email: created.novoUsuario.email,
        tipo: created.novoUsuario.tipo,
      },
      adolescente: created.adolescente,
      conta: created.conta,
    };
  }

  private async ensureUniqueAdolescenteFields(
    usuario: string,
    email?: string,
    cpf?: string,
  ) {
    const existingUser = await this.prisma.usuario.findFirst({
      where: {
        OR: email ? [{ usuario }, { email }] : [{ usuario }],
      },
    });

    if (existingUser) {
      if (email && existingUser.email === email) {
        throw new BadRequestException('Email ja esta em uso');
      }

      throw new BadRequestException('Usuário de login ja esta em uso');
    }

    if (cpf) {
      const existingCpf = await this.prisma.adolescente.findFirst({
        where: { cpf },
      });

      if (existingCpf) {
        throw new BadRequestException('CPF ja esta em uso');
      }
    }
  }
}
