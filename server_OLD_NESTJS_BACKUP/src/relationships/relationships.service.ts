import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class RelationshipsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  // ============ FOLLOWS ============
  async toggleFollow(followerId: string, followeeId: string) {
    if (followerId === followeeId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followeeId: { followerId, followeeId },
      },
    });

    if (existing) {
      // Unfollow
      await this.prisma.follow.delete({
        where: { id: existing.id },
      });
      
      this.events.emit('user.unfollowed', {
        followerId,
        followeeId,
        timestamp: new Date(),
      });

      return { action: 'unfollowed' };
    } else {
      // Follow
      await this.prisma.follow.create({
        data: { followerId, followeeId },
      });

      this.events.emit('user.followed', {
        followerId,
        followeeId,
        timestamp: new Date(),
      });

      return { action: 'followed' };
    }
  }

  async getFollowers(userId: string, limit = 100, offset = 0) {
    return this.prisma.follow.findMany({
      where: { followeeId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFollowing(userId: string, limit = 100, offset = 0) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        followee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============ FRIENDSHIPS ============
  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot friend yourself');
    }

    // Check if already exists
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'BLOCKED') {
        throw new BadRequestException('Cannot send friend request');
      }
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('Already friends');
      }
      if (existing.status === 'PENDING') {
        throw new BadRequestException('Friend request already sent');
      }
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
    });

    this.events.emit('friend.requested', {
      senderId,
      receiverId,
      friendshipId: friendship.id,
      timestamp: new Date(),
    });

    return friendship;
  }

  async acceptFriendRequest(requestId: string, userId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendship) {
      throw new BadRequestException('Friend request not found');
    }

    if (friendship.receiverId !== userId) {
      throw new BadRequestException('Not authorized to accept this request');
    }

    if (friendship.status !== 'PENDING') {
      throw new BadRequestException('Request not pending');
    }

    const updated = await this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });

    this.events.emit('friend.accepted', {
      senderId: friendship.senderId,
      receiverId: friendship.receiverId,
      friendshipId: friendship.id,
      timestamp: new Date(),
    });

    return updated;
  }

  async declineFriendRequest(requestId: string, userId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendship) {
      throw new BadRequestException('Friend request not found');
    }

    if (friendship.receiverId !== userId) {
      throw new BadRequestException('Not authorized to decline this request');
    }

    await this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'DECLINED' },
    });

    return { message: 'Friend request declined' };
  }

  async getFriends(userId: string, limit = 100, offset = 0) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return friendships.map(f => ({
      friendship: f,
      friend: f.senderId === userId ? f.receiver : f.sender,
    }));
  }

  async getPendingRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2, status: 'ACCEPTED' },
          { senderId: userId2, receiverId: userId1, status: 'ACCEPTED' },
        ],
      },
    });

    return !!friendship;
  }

  async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followeeId: { followerId, followeeId },
      },
    });

    return !!follow;
  }
}
