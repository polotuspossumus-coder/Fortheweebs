import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelationshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleFollow(userId: string, followerId: string) {
    const existingFollow = await this.prisma.follow.findFirst({
      where: {
        followerId,
        followeeId: userId,
      },
    });

    if (existingFollow) {
      await this.prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      return { following: false };
    }

    await this.prisma.follow.create({
      data: {
        followerId,
        followeeId: userId,
      },
    });

    return { following: true };
  }

  async getFollowers(userId: string, limit = 50, offset = 0) {
    const followers = await this.prisma.follow.findMany({
      where: { followeeId: userId },
      take: limit,
      skip: offset,
    });

    return followers;
  }

  async getFollowing(userId: string, limit = 50, offset = 0) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      take: limit,
      skip: offset,
    });

    return following;
  }

  async getFriends(userId: string, limit = 50, offset = 0) {
    const friendships = await this.prisma.friendship.findMany({
      where: { senderId: userId, status: 'accepted' },
      take: limit,
      skip: offset,
    });

    return friendships;
  }

  async areFriends(userId1: string, userId2: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2, status: 'accepted' },
          { senderId: userId2, receiverId: userId1, status: 'accepted' },
        ],
      },
    });

    return !!friendship;
  }

  async getPendingRequests(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'pending',
      },
    });

    return requests;
  }

  async sendFriendRequest(fromUserId: string, toUserId: string) {
    const friendRequest = await this.prisma.friendship.create({
      data: {
        senderId: fromUserId,
        receiverId: toUserId,
        status: 'pending',
      },
    });

    return friendRequest;
  }

  async acceptFriendRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!request || request.receiverId !== userId) {
      throw new Error('Friend request not found');
    }

    await this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });

    return { accepted: true };
  }

  async declineFriendRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!request || request.receiverId !== userId) {
      throw new Error('Friend request not found');
    }

    await this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'declined' },
    });

    return { declined: true };
  }
}
