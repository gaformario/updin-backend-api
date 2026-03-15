import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdolescenteDto {
  @ApiProperty({
    example: 'Gabriel Oliveira',
  })
  nome: string;

  @ApiProperty({
    example: 'mariana12',
  })
  usuario: string;

  @ApiPropertyOptional({
    example: 'gabriel@familia.com',
  })
  email?: string;

  @ApiProperty({
    example: 'senha123',
  })
  senhaHash: string;

  @ApiProperty({
    example: '2011-03-20',
  })
  dataNascimento: string;

  @ApiPropertyOptional({
    example: '12345678900',
  })
  cpf?: string;

  @ApiPropertyOptional({
    example: '+55 11 99999-9999',
  })
  telefone?: string;
}
