import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';

class SubmitQuizRespostaDto {
  @ApiProperty({ example: 'uuid-pergunta' })
  @IsString()
  perguntaId: string;

  @ApiProperty({ example: 'uuid-alternativa' })
  @IsString()
  alternativaId: string;
}

export class SubmitQuizDto {
  @ApiProperty({ type: [SubmitQuizRespostaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitQuizRespostaDto)
  respostas: SubmitQuizRespostaDto[];
}

export { SubmitQuizRespostaDto };
