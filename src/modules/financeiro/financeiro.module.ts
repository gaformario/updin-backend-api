import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContasController } from './controllers/contas.controller';
import { MesadasController } from './controllers/mesadas.controller';
import { MovimentacoesController } from './controllers/movimentacoes.controller';
import { ContasService } from './services/contas.service';
import { MesadasService } from './services/mesadas.service';
import { MovimentacoesService } from './services/movimentacoes.service';

@Module({
  imports: [AuthModule],
  controllers: [ContasController, MesadasController, MovimentacoesController],
  providers: [ContasService, MesadasService, MovimentacoesService],
  exports: [ContasService, MesadasService, MovimentacoesService],
})
export class FinanceiroModule {}
