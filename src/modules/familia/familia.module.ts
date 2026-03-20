import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdolescentesController } from './controllers/adolescentes.controller';
import { ResponsaveisController } from './controllers/responsaveis.controller';
import { AdolescentesService } from './services/adolescentes.service';
import { ResponsaveisService } from './services/responsaveis.service';

@Module({
  imports: [AuthModule],
  controllers: [ResponsaveisController, AdolescentesController],
  providers: [ResponsaveisService, AdolescentesService],
  exports: [ResponsaveisService, AdolescentesService],
})
export class FamiliaModule {}
