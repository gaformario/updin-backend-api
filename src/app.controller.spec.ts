import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = moduleRef.get(AppController);
  });

  it('returns a healthy status payload', () => {
    expect(controller.health()).toEqual({
      status: 'ok',
      service: 'updin-api',
      docs: '/docs',
    });
  });
});
