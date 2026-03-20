import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/auth/interfaces/authenticated-request.interface';
import { CreateAdolescenteDto } from '../dto/create-adolescente.dto';
import { ResponsaveisService } from '../services/responsaveis.service';

@ApiTags('Responsaveis')
@ApiBearerAuth()
@Controller('responsaveis')
export class ResponsaveisController {
  constructor(private readonly responsaveisService: ResponsaveisService) {}

  @Get('me')
  @ApiOperation({ summary: 'Dados do responsavel autenticado' })
  async getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.responsaveisService.findMine(user.userId);
  }

  @Get('me/adolescentes')
  @ApiOperation({ summary: 'Listar adolescentes do responsavel autenticado' })
  async getMyAdolescentes(@CurrentUser() user: AuthenticatedUser) {
    return this.responsaveisService.findAdolescentesByUser(user.userId);
  }

  @Post(':responsavelId/adolescentes')
  @ApiOperation({ summary: 'Cadastrar adolescente vinculado a um responsavel' })
  @ApiParam({ name: 'responsavelId', example: 'uuid-do-responsavel' })
  async createAdolescente(
    @Param('responsavelId') responsavelId: string,
    @Body() body: CreateAdolescenteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.responsaveisService.createAdolescente(
      user.userId,
      responsavelId,
      body,
    );
  }

  @Get(':responsavelId')
  @ApiOperation({ summary: 'Buscar responsavel pelo id' })
  @ApiParam({ name: 'responsavelId', example: 'uuid-do-responsavel' })
  async getById(
    @Param('responsavelId') responsavelId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.responsaveisService.findById(user.userId, responsavelId);
  }

  @Get(':responsavelId/adolescentes')
  @ApiOperation({ summary: 'Listar adolescentes pelo id do responsavel' })
  @ApiParam({ name: 'responsavelId', example: 'uuid-do-responsavel' })
  async getAdolescentesByResponsavelId(
    @Param('responsavelId') responsavelId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.responsaveisService.findAdolescentesByResponsavelId(
      user.userId,
      responsavelId,
    );
  }
}
