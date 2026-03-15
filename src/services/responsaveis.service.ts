import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdolescenteDto } from 'src/models/dtos/creata-adolescente.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResponsaveisService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(responsavelId: string) {
    const responsavel = await this.prisma.responsavel.findUnique({
      where: { id: responsavelId },
    });

    if (!responsavel) {
      throw new NotFoundException('Responsável não encontrado');
    }

    return responsavel;
  }

  async findByUsuarioId(usuarioId: string) {
    const responsavel = await this.prisma.responsavel.findFirst({
      where: { usuarioId },
    });

    if (!responsavel) {
      throw new NotFoundException('Responsável não encontrado');
    }

    return responsavel;
  }

  async findAdolescentesByResponsavelId(responsavelId: string) {
    await this.findById(responsavelId);

    return this.prisma.adolescente.findMany({
      where: { responsavelId },
      include: {
        usuario: {
          select: {
            nome: true,
            usuario: true,
            email: true,
          },
        },
      },
    });
  }

  async findAdolescentesByUsuarioId(usuarioId: string) {
    const responsavel = await this.findByUsuarioId(usuarioId);

    return this.prisma.adolescente.findMany({
      where: { responsavelId: responsavel.id },
      include: {
        usuario: {
          select: {
            nome: true,
            usuario: true,
            email: true,
          },
        },
      },
    });
  }

  async createAdolescente(responsavelId: string, body: CreateAdolescenteDto) {
    const responsavel = await this.findById(responsavelId);

    const existing = await this.prisma.usuario.findFirst({
      where: { usuario: body.usuario },
    });
    if (existing) {
      throw new BadRequestException('Já existe um nome de usuário para login');
    }

    let emailUsuario: string | undefined;
    if (body.email) {
      emailUsuario = body.email;
      const existingEmail = await this.prisma.usuario.findUnique({
        where: { email: emailUsuario },
      });
      if (existingEmail) {
        throw new BadRequestException('Email já está em uso');
      }
    }

    const novoUsuarioData: {
      nome: string;
      usuario: string;
      email?: string;
      senhaHash: string;
      tipo: 'adolescente';
      ativo: boolean;
    } = {
      nome: body.nome,
      usuario: body.usuario,
      senhaHash: body.senhaHash,
      tipo: 'adolescente',
      ativo: true,
    };
    if (emailUsuario) {
      novoUsuarioData.email = emailUsuario;
    }

    const novoUsuario = await this.prisma.usuario.create({
      data: novoUsuarioData,
    });

    const adolescente = await this.prisma.adolescente.create({
      data: {
        usuarioId: novoUsuario.id,
        responsavelId: responsavel.id,
        cpf: body.cpf,
        telefone: body.telefone,
        dataNascimento: new Date(body.dataNascimento),
      },
    });

    const conta = await this.prisma.conta.create({
      data: {
        adolescenteId: adolescente.id,
        saldoTotal: 0,
      },
    });

    return {
      message: 'Adolescente cadastrado com sucesso',
      adolescente,
      conta,
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo,
      },
    };
  }
}
