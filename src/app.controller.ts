import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/auth/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check da API' })
  health() {
    return {
      status: 'ok',
      service: 'updin-api',
      docs: '/docs',
    };
  }
}
