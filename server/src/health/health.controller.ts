import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

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
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      throw new Error('Service not ready');
    }
  }

  @Public()
  @Get('live')
  async live() {
    return { status: 'alive' };
  }
}
