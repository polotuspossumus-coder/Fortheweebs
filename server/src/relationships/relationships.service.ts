import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelationshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleFollow(userId: string, followerId: string) {
    const existingFollow = await this.prisma.follow.findFirst({
      where: {
        followerId,
        followingId: userId,
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
        followingId: userId,
      },
    });

    return { following: true };
  }

  async getFollowers(userId: string, limit = 50, offset = 0) {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });

    return followers.map(f => f.follower);
  }

  async getFollowing(userId: string, limit = 50, offset = 0) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });

    return following.map(f => f.following);
  }

  async getFriends(userId: string, limit = 50, offset = 0) {
    const friendships = await this.prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });

    return friendships.map(f => f.friend);
  }

  async getPendingRequests(userId: string) {
    const requests = await this.prisma.friendRequest.findMany({
      where: {
        toUserId: userId,
        status: 'pending',
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return requests;
  }

  async sendFriendRequest(fromUserId: string, toUserId: string) {
    const friendRequest = await this.prisma.friendRequest.create({
      data: {
        fromUserId,
        toUserId,
        status: 'pending',
      },
    });

    return friendRequest;
  }

  async acceptFriendRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.toUserId !== userId) {
      throw new Error('Friend request not found');
    }

    await this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });

    // Create bidirectional friendship
    await this.prisma.friendship.createMany({
      data: [
        { userId: request.fromUserId, friendId: request.toUserId },
        { userId: request.toUserId, friendId: request.fromUserId },
      ],
    });

    return { accepted: true };
  }

  async declineFriendRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.toUserId !== userId) {
      throw new Error('Friend request not found');
    }

    await this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'declined' },
    });

    return { declined: true };
  }
}
