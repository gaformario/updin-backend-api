import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'carloss',
  })
  usuario: string;

  @ApiProperty({
    example: 'hash-fake',
  })
  senhaHash: string;
}
