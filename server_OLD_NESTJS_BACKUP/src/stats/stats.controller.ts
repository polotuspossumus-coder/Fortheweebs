import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get('users/:id/stats')
  async getUserStats(@Param('id') userId: string) {
    return this.stats.getUserStats(userId);
  }

  @Get('users/:id/revenue')
  async getRevenueStats(@Param('id') userId: string, @Request() req) {
    // Only allow viewing own revenue or if admin/owner
    if (userId !== req.user.sub) {
      // Check if requester is owner/admin
      const user = await this.stats.getUser(req.user.sub);
      if (!user?.isOwner && user?.tier !== 'LIFETIME_VIP') {
        throw new Error('Not authorized to view revenue');
      }
    }
    return this.stats.getRevenueStats(userId);
  }

  @Get('dashboard/stats')
  async getDashboardStats(@Request() req) {
    return this.stats.getDashboardStats(req.user.sub);
  }
}
