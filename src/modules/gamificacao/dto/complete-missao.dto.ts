import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CompleteMissaoDto {
  @ApiPropertyOptional({ example: 'Missao concluida com foto enviada' })
  @IsOptional()
  @IsString()
  observacao?: string;
}
