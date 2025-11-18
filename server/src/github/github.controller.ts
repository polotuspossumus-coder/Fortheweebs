import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('api/github')
@UseGuards(JwtAuthGuard)
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  /**
   * Get GitHub token (secured endpoint)
   * Only accessible to authenticated users
   */
  @Get('token')
  async getToken(@Request() req) {
    if (!req.user) {
      throw new Error('Authentication required');
    }
    return this.githubService.getToken();
  }

  /**
   * Create GitHub Issue from bug report
   * Public endpoint - anyone can report bugs
   */
  @Public()
  @Post('issues')
  async createIssue(@Request() req, @Body() body: any) {
    const { title, body: description, labels } = body;
    return this.githubService.createIssue(title, description, labels);
  }

  /**
   * List recent GitHub issues
   * Admin only
   */
  @Get('issues')
  async listIssues(@Request() req) {
    // Check if user is admin/owner
    const userId = req.user?.id || req.user?.sub;
    const userTier = req.user?.tier;
    
    if (userId !== 'owner' && userTier !== 'OWNER' && userTier !== 'VIP') {
      throw new Error('Admin access required');
    }

    return this.githubService.listIssues();
  }
}
