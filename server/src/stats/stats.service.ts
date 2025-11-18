import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(userId: string) {
    const [followers, following, posts] = await Promise.all([
      this.prisma.follow.count({ where: { followeeId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
      this.prisma.post.count({ where: { authorId: userId } }),
    ]);

    return {
      followers,
      following,
      posts,
      likes: 0, // Would need likes table in schema
    };
  }

  async getRevenueStats(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        creatorId: userId,
        status: 'active',
      },
    });

    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.priceCents, 0);
    const monthlyRevenue = totalRevenue; // Simplified - would need date filtering for actual monthly

    return {
      totalSubscribers: subscriptions.length,
      monthlyRevenue: monthlyRevenue / 100, // Convert to dollars
      totalRevenue: totalRevenue / 100,
    };
  }

  async getDashboardStats(userId: string) {
    const [userStats, revenueStats] = await Promise.all([
      this.getUserStats(userId),
      this.getRevenueStats(userId),
    ]);

    return {
      ...userStats,
      ...revenueStats,
    };
  }
}
