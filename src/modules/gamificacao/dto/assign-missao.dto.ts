import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class AssignMissaoDto {
  @ApiProperty({ example: 'uuid-adolescente' })
  @IsString()
  adolescenteId: string;

  @ApiPropertyOptional({ example: '2026-03-25' })
  @IsOptional()
  @IsDateString()
  dataLimite?: string;

  @ApiPropertyOptional({ example: 'Fazer com capricho' })
  @IsOptional()
  @IsString()
  observacao?: string;
}
