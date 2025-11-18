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
   * Rate limited and validated
   */
  @Public()
  @Post('issues')
  async createIssue(@Request() req, @Body() body: any) {
    const { title, body: description, labels } = body;

    // Input validation
    if (!title || typeof title !== 'string' || title.length > 200) {
      throw new Error('Invalid title: must be 1-200 characters');
    }

    if (!description || typeof description !== 'string' || description.length > 10000) {
      throw new Error('Invalid description: must be 1-10000 characters');
    }

    // Sanitize title and description
    const sanitizedTitle = title.replace(/<[^>]*>/g, '').slice(0, 200);
    const sanitizedDescription = description.replace(/<script[^>]*>.*?<\/script>/gi, '').slice(0, 10000);

    // Validate labels
    const allowedLabels = ['bug', 'bug-backend', 'severity:low', 'severity:medium', 'severity:high', 'severity:critical', 'priority:urgent'];
    const validLabels = Array.isArray(labels) 
      ? labels.filter(l => allowedLabels.includes(l))
      : ['bug'];

    return this.githubService.createIssue(sanitizedTitle, sanitizedDescription, validLabels);
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
