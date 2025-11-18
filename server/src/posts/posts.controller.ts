import { Controller, Post, Get, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('posts')
export class PostsController {
  constructor(private posts: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Body() body: any, @Request() req) {
    return this.posts.createPost(req.user.sub, body);
  }

  @Public()
  @Get('feed')
  async getFeed(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Request() req?: any,
  ) {
    const userId = req?.user?.sub || null;
    return this.posts.getFeed(userId, limit, offset);
  }

  @Public()
  @Get(':id')
  async getPost(@Param('id') postId: string, @Request() req?: any) {
    const userId = req?.user?.sub || null;
    return this.posts.getPost(postId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likePost(@Param('id') postId: string, @Request() req) {
    return this.posts.likePost(postId, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') postId: string, @Request() req) {
    return this.posts.deletePost(postId, req.user.sub);
  }
}

@Controller('users/:id/posts')
export class UserPostsController {
  constructor(private posts: PostsService) {}

  @Public()
  @Get()
  async getUserPosts(
    @Param('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Request() req?: any,
  ) {
    const viewerId = req?.user?.sub || null;
    return this.posts.getUserPosts(userId, viewerId, limit, offset);
  }
}
