import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RelationshipsService } from '../relationships/relationships.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { EventsService } from '../events/events.service';

interface CreatePostDto {
  title?: string;
  body: string;
  visibility: 'PUBLIC' | 'FRIENDS' | 'SUBSCRIBERS' | 'CUSTOM';
  isPaid?: boolean;
  priceCents?: number;
  customListId?: string;
  hasCGI?: boolean;
  cgiData?: any;
}

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private relationships: RelationshipsService,
    private subscriptions: SubscriptionsService,
    private events: EventsService,
  ) {}

  async createPost(authorId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        authorId,
        title: dto.title,
        body: dto.body,
        visibility: dto.visibility,
        isPaid: dto.isPaid || false,
        priceCents: dto.priceCents,
        customListId: dto.customListId,
        hasCGI: dto.hasCGI || false,
        cgiData: dto.cgiData,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            tier: true,
          },
        },
      },
    });

    this.events.emit('post.created', {
      postId: post.id,
      authorId,
      visibility: dto.visibility,
      isPaid: dto.isPaid,
      timestamp: new Date(),
    });

    return post;
  }

  async canViewPost(viewerId: string | null, post: any): Promise<boolean> {
    // Public posts are always visible
    if (post.visibility === 'PUBLIC') {
      return true;
    }

    // Must be logged in for non-public posts
    if (!viewerId) {
      return false;
    }

    // Author can always see their own posts
    if (viewerId === post.authorId) {
      return true;
    }

    // Owner and VIPs can see everything
    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerId },
    });
    if (viewer?.isOwner || viewer?.tier === 'LIFETIME_VIP') {
      return true;
    }

    // Check visibility rules
    switch (post.visibility) {
      case 'FRIENDS':
        return this.relationships.areFriends(viewerId, post.authorId);

      case 'SUBSCRIBERS':
        return this.subscriptions.hasActiveSubscription(viewerId, post.authorId);

      case 'CUSTOM':
        if (!post.customListId) return false;
        const member = await this.prisma.listMember.findUnique({
          where: {
            listId_memberUserId: {
              listId: post.customListId,
              memberUserId: viewerId,
            },
          },
        });
        return !!member;

      default:
        return false;
    }
  }

  async getPost(postId: string, viewerId: string | null) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            tier: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const canView = await this.canViewPost(viewerId, post);
    if (!canView) {
      throw new ForbiddenException('You do not have access to this post');
    }

    return post;
  }

  async getFeed(viewerId: string | null, limit = 50, offset = 0) {
    // Get all posts, then filter by visibility
    const posts = await this.prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            tier: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 3, // Fetch more to account for filtering
      skip: offset,
    });

    // Filter posts based on visibility rules
    const visiblePosts = [];
    for (const post of posts) {
      const canView = await this.canViewPost(viewerId, post);
      if (canView) {
        visiblePosts.push(post);
        if (visiblePosts.length >= limit) break;
      }
    }

    return visiblePosts;
  }

  async getUserPosts(authorId: string, viewerId: string | null, limit = 50, offset = 0) {
    const posts = await this.prisma.post.findMany({
      where: { authorId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            tier: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 2,
      skip: offset,
    });

    const visiblePosts = [];
    for (const post of posts) {
      const canView = await this.canViewPost(viewerId, post);
      if (canView) {
        visiblePosts.push(post);
        if (visiblePosts.length >= limit) break;
      }
    }

    return visiblePosts;
  }

  async likePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const canView = await this.canViewPost(userId, post);
    if (!canView) {
      throw new ForbiddenException('You do not have access to this post');
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });

    return { liked: true };
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this post');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { deleted: true };
  }
}
