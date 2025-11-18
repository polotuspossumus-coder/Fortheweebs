import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: string) {
    const [friendsCount, followersCount, followingCount, subscribersCount, subscriptionsCount, postsCount] = await Promise.all([
      // Friends count (accepted friendships where user is involved)
      this.prisma.friendship.count({
        where: {
          OR: [
            { senderId: userId, status: 'ACCEPTED' },
            { receiverId: userId, status: 'ACCEPTED' },
          ],
        },
      }),

      // Followers count
      this.prisma.follow.count({
        where: { followeeId: userId },
      }),

      // Following count
      this.prisma.follow.count({
        where: { followerId: userId },
      }),

      // Subscribers to this user
      this.prisma.subscription.count({
        where: {
          creatorId: userId,
          status: 'ACTIVE',
        },
      }),

      // Subscriptions this user has
      this.prisma.subscription.count({
        where: {
          subscriberId: userId,
          status: 'ACTIVE',
        },
      }),

      // Posts count
      this.prisma.post.count({
        where: { authorId: userId },
      }),
    ]);

    return {
      friendsCount,
      followersCount,
      followingCount,
      subscribersCount,
      subscriptionsCount,
      postsCount,
    };
  }

  async getRevenueStats(creatorId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        creatorId,
        status: 'ACTIVE',
      },
      select: {
        priceCents: true,
        tier: true,
        createdAt: true,
      },
    });

    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.priceCents, 0);
    const subscriptionsByTier = subscriptions.reduce((acc, sub) => {
      acc[sub.tier] = (acc[sub.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenueCents: totalRevenue,
      totalRevenueUSD: totalRevenue / 100,
      activeSubscribers: subscriptions.length,
      subscriptionsByTier,
    };
  }

  async getDashboardStats(userId: string) {
    const [userStats, revenueStats] = await Promise.all([
      this.getUserStats(userId),
      this.getRevenueStats(userId),
    ]);

    return {
      ...userStats,
      revenue: revenueStats,
    };
  }
}
