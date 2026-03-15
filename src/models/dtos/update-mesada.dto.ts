import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMesadaDto {
  @ApiPropertyOptional({
    example: 150,
  })
  valor?: number;

  @ApiPropertyOptional({
    example: 'mensal',
    enum: ['semanal', 'quinzenal', 'mensal'],
  })
  periodicidade?: 'semanal' | 'quinzenal' | 'mensal';

  @ApiPropertyOptional({
    example: true,
  })
  ativa?: boolean;
}
