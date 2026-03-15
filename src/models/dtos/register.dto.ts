import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Carlos Silva',
  })
  nome: string;

  @ApiProperty({
    example: 'carloss',
  })
  usuario: string;

  @ApiProperty({
    example: 'carlos@familia.com',
  })
  email: string;

  @ApiProperty({
    example: 'hash-fake',
  })
  senhaHash: string;

  @ApiProperty({
    example: 'responsavel',
    enum: ['responsavel', 'adolescente'],
  })
  tipo: 'responsavel' | 'adolescente';

  @ApiPropertyOptional({
    example: '12345678901',
  })
  cpf?: string;

  @ApiPropertyOptional({
    example: '+55 11 99999-9999',
  })
  telefone?: string;
}
