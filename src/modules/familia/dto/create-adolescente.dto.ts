import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateAdolescenteDto {
  @ApiProperty({ example: 'Gabriel Oliveira' })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({ example: 'gabriel12' })
  @IsString()
  @MinLength(3)
  usuario: string;

  @ApiPropertyOptional({ example: 'gabriel@familia.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({ example: '2011-03-20' })
  @IsDateString()
  dataNascimento: string;

  @ApiPropertyOptional({ example: '12345678900' })
  @IsOptional()
  @Matches(/^\d{11}$/)
  cpf?: string;

  @ApiPropertyOptional({ example: '+55 11 99999-9999' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  telefone?: string;
}
