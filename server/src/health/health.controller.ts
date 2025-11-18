import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  async check() {
    // Simple health check without database dependency
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'fortheweebs-api',
      version: process.env.npm_package_version || '1.0.0',
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
}
