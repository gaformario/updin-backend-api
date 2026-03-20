import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMovimentacaoDto {
  @ApiProperty({ example: 'debito', enum: ['credito', 'debito'] })
  @IsEnum(['credito', 'debito'])
  tipo: 'credito' | 'debito';

  @ApiProperty({
    example: 'gasto',
    enum: ['mesada', 'ajuste_manual', 'gasto', 'recompensa'],
  })
  @IsEnum(['mesada', 'ajuste_manual', 'gasto', 'recompensa'])
  origem: 'mesada' | 'ajuste_manual' | 'gasto' | 'recompensa';

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @ApiPropertyOptional({ example: 'Compra de jogo' })
  @IsOptional()
  @IsString()
  descricao?: string;
}
