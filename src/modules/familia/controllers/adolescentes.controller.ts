import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/auth/interfaces/authenticated-request.interface';
import { AdolescentesService } from '../services/adolescentes.service';

@ApiTags('Adolescentes')
@ApiBearerAuth()
@Controller('adolescentes')
export class AdolescentesController {
  constructor(private readonly adolescentesService: AdolescentesService) {}

  @Get(':adolescenteId')
  @ApiOperation({ summary: 'Buscar adolescente por ID' })
  @ApiParam({ name: 'adolescenteId', example: 'uuid-adolescente' })
  async getById(
    @Param('adolescenteId') adolescenteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adolescentesService.getAdolescenteById(
      user.userId,
      adolescenteId,
    );
  }

  @Get(':adolescenteId/conta')
  @ApiOperation({ summary: 'Buscar conta do adolescente' })
  @ApiParam({ name: 'adolescenteId', example: 'uuid-adolescente' })
  async getConta(
    @Param('adolescenteId') adolescenteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adolescentesService.getAdolescenteConta(
      user.userId,
      adolescenteId,
    );
  }

  @Get(':adolescenteId/dashboard')
  @ApiOperation({ summary: 'Dashboard financeiro consolidado do adolescente' })
  @ApiParam({ name: 'adolescenteId', example: 'uuid-adolescente' })
  async getDashboard(
    @Param('adolescenteId') adolescenteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adolescentesService.getAdolescenteDashboard(
      user.userId,
      adolescenteId,
    );
  }
}
