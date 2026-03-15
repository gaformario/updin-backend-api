import { ApiProperty } from '@nestjs/swagger';

export class CreateMesadaDto {
  @ApiProperty({
    example: 'uuid-adolescente',
  })
  adolescenteId: string;

  @ApiProperty({
    example: 'uuid-responsavel',
  })
  responsavelId: string;

  @ApiProperty({
    example: 100,
  })
  valor: number;

  @ApiProperty({
    example: 'mensal',
    enum: ['semanal', 'quinzenal', 'mensal'],
  })
  periodicidade: 'semanal' | 'quinzenal' | 'mensal';
}
