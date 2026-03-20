import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthGuard } from './common/auth/guards/auth.guard';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { FamiliaModule } from './modules/familia/familia.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { GamificacaoModule } from './modules/gamificacao/gamificacao.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CommonModule,
    AuthModule,
    FamiliaModule,
    FinanceiroModule,
    GamificacaoModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
