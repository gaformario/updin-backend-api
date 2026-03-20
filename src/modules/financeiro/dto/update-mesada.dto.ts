import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateMesadaDto {
  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor?: number;

  @ApiPropertyOptional({
    example: 'mensal',
    enum: ['semanal', 'quinzenal', 'mensal'],
  })
  @IsOptional()
  @IsEnum(['semanal', 'quinzenal', 'mensal'])
  periodicidade?: 'semanal' | 'quinzenal' | 'mensal';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativa?: boolean;

  @ApiPropertyOptional({ example: 'Mesada revisada para o novo ciclo' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: '2026-03-20' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;
}
