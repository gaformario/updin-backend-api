import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdolescentesController } from './controllers/adolescentes.controller';
import { AuthController } from './controllers/auth.controller';
import { ContasController } from './controllers/contas.controller';
import { MesadasController } from './controllers/mesadas.controller';
import { MovimentacoesController } from './controllers/movimentacoes.controller';
import { ResponsaveisController } from './controllers/responsaveis.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AdolescentesService } from './services/adolescentes.service';
import { AuthService } from './services/auth.service';
import { ContasService } from './services/contas.service';
import { MesadasService } from './services/mesadas.service';
import { MovimentacoesService } from './services/movimentacoes.service';
import { ResponsaveisService } from './services/responsaveis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
  ],
  controllers: [
    // AppController,
    AuthController,
    ResponsaveisController,
    AdolescentesController,
    ContasController,
    MesadasController,
    MovimentacoesController,
  ],
  providers: [
    AppService,
    AuthService,
    ResponsaveisService,
    AdolescentesService,
    ContasService,
    MesadasService,
    MovimentacoesService,
  ],
})
export class AppModule {}
