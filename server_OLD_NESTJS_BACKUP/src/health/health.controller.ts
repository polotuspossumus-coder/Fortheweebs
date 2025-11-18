import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'fortheweebs-api',
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get('ready')
  async ready() {
    return { status: 'ready' };
  }

  @Public()
  @Get('live')
  async live() {
    return { status: 'alive' };
  }
}
