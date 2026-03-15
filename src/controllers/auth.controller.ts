import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LoginDto } from 'src/models/dtos/login.dto';
import { RegisterDto } from 'src/models/dtos/register.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar responsável e criar perfil' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(
      body.nome,
      body.usuario,
      body.email,
      body.senhaHash,
      body.tipo,
      body.cpf,
      body.telefone,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de usuário' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.usuario, body.senhaHash);
  }

  @Get('me')
  @ApiOperation({ summary: 'Retornar dados do usuário atual' })
  me(@Query('usuarioId') userId: string) {
    return this.authService.getMe(userId || '');
  }
}
