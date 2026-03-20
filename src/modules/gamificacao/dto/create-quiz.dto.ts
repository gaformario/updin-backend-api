import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class CreateQuizAlternativaDto {
  @ApiProperty({ example: 'Guardar 10% do dinheiro' })
  @IsString()
  @MinLength(1)
  texto: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  correta: boolean;
}

class CreateQuizPerguntaDto {
  @ApiProperty({ example: 'Qual e um bom habito financeiro?' })
  @IsString()
  @MinLength(3)
  enunciado: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ordem: number;

  @ApiProperty({ type: [CreateQuizAlternativaDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateQuizAlternativaDto)
  alternativas: CreateQuizAlternativaDto[];
}

export class CreateQuizDto {
  @ApiProperty({ example: 'Quiz de Educacao Financeira' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  titulo: string;

  @ApiPropertyOptional({ example: 'Quiz introdutorio sobre mesada e poupanca' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ type: [CreateQuizPerguntaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuizPerguntaDto)
  perguntas: CreateQuizPerguntaDto[];
}

export { CreateQuizAlternativaDto, CreateQuizPerguntaDto };
