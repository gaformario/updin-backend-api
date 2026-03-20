import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UserType } from '@prisma/client';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    tokenService = moduleRef.get(TokenService);
  });

  it('signs and validates tokens', () => {
    const token = tokenService.signToken({
      userId: 'user-1',
      tipo: UserType.responsavel,
    });

    expect(tokenService.verifyToken(token)).toEqual({
      userId: 'user-1',
      tipo: UserType.responsavel,
    });
  });
});
