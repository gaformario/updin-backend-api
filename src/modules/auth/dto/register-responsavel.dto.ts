import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterResponsavelDto {
  @ApiProperty({ example: 'Carlos Silva' })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({ example: 'carloss' })
  @IsString()
  @MinLength(3)
  usuario: string;

  @ApiProperty({ example: 'carlos@familia.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsOptional()
  @Matches(/^\d{11}$/)
  cpf?: string;

  @ApiPropertyOptional({ example: '+55 11 99999-9999' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  telefone?: string;
}
