import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { Public } from '../../common/auth/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/auth/interfaces/authenticated-request.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterResponsavelDto } from './dto/register-responsavel.dto';

@ApiTags('Autenticacao')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/responsavel')
  @Public()
  @ApiOperation({
    summary: 'Cadastrar responsavel e criar sua conta de acesso',
  })
  registerResponsavel(@Body() body: RegisterResponsavelDto) {
    return this.authService.registerResponsavel(body);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Autenticar usuario e retornar token de acesso' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuario autenticado' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.userId);
  }
}
