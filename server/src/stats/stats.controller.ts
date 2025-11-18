import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller()
export class StatsController {
  constructor(private stats: StatsService) {}

  @Public()
  @Get('users/:id/stats')
  async getUserStats(@Param('id') userId: string) {
    return this.stats.getUserStats(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id/revenue')
  async getRevenueStats(@Param('id') userId: string, @Request() req: any) {
    // Only allow viewing own revenue
    if (userId !== req.user.userId) {
      throw new Error('Not authorized to view revenue');
    }
    return this.stats.getRevenueStats(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard/stats')
  async getDashboardStats(@Request() req: any) {
    return this.stats.getDashboardStats(req.user.userId);
  }
}

