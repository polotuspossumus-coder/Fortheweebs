import { Controller, Post, Get, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RelationshipsService } from './relationships.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class RelationshipsController {
  constructor(private relationships: RelationshipsService) {}

  // ============ FOLLOWS ============
  @Post('users/:id/follow')
  async toggleFollow(@Param('id') userId: string, @Request() req) {
    return this.relationships.toggleFollow(req.user.sub, userId);
  }

  @Get('users/:id/followers')
  async getFollowers(
    @Param('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.relationships.getFollowers(userId, limit, offset);
  }

  @Get('users/:id/following')
  async getFollowing(
    @Param('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.relationships.getFollowing(userId, limit, offset);
  }

  // ============ FRIENDSHIPS ============
  @Post('users/:id/friend-requests')
  async sendFriendRequest(@Param('id') userId: string, @Request() req) {
    return this.relationships.sendFriendRequest(req.user.sub, userId);
  }

  @Post('friend-requests/:id/accept')
  async acceptFriendRequest(@Param('id') requestId: string, @Request() req) {
    return this.relationships.acceptFriendRequest(requestId, req.user.sub);
  }

  @Post('friend-requests/:id/decline')
  async declineFriendRequest(@Param('id') requestId: string, @Request() req) {
    return this.relationships.declineFriendRequest(requestId, req.user.sub);
  }

  @Get('users/:id/friends')
  async getFriends(
    @Param('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.relationships.getFriends(userId, limit, offset);
  }

  @Get('users/:id/friend-requests/pending')
  async getPendingRequests(@Param('id') userId: string) {
    return this.relationships.getPendingRequests(userId);
  }
}
