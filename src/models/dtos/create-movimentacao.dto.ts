import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMovimentacaoDto {
  @ApiProperty({
    example: 'uuid-conta',
  })
  contaId: string;

  @ApiProperty({
    example: 'credito',
    enum: ['credito', 'debito'],
  })
  tipo: 'credito' | 'debito';

  @ApiProperty({
    example: 'mesada',
    enum: ['mesada', 'ajuste_manual', 'gasto'],
  })
  origem: 'mesada' | 'ajuste_manual' | 'gasto';

  @ApiProperty({
    example: 100,
  })
  valor: number;

  @ApiPropertyOptional({
    example: 'Mesada de junho',
  })
  descricao?: string;
}
