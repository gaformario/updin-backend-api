import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMesadaDto {
  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @ApiProperty({ example: 'mensal', enum: ['semanal', 'quinzenal', 'mensal'] })
  @IsEnum(['semanal', 'quinzenal', 'mensal'])
  periodicidade: 'semanal' | 'quinzenal' | 'mensal';

  @ApiPropertyOptional({ example: 'Mesada base da semana' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: '2026-03-20' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;
}
