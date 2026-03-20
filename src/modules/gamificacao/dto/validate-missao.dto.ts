import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ValidateMissaoDto {
  @ApiPropertyOptional({ example: 'Muito bem executada' })
  @IsOptional()
  @IsString()
  observacao?: string;
}
