import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubService {
  private readonly githubToken: string;
  private readonly repoOwner = 'polotuspossumus-coder';
  private readonly repoName = 'Fortheweebs';

  constructor(private configService: ConfigService) {
    this.githubToken = this.configService.get<string>('GITHUB_TOKEN');
  }

  /**
   * Get GitHub token (returns it securely to authenticated users)
   */
  async getToken() {
    if (!this.githubToken) {
      throw new Error('GitHub token not configured');
    }
    return { token: this.githubToken };
  }

  /**
   * Create GitHub Issue
   */
  async createIssue(title: string, body: string, labels: string[] = ['bug']) {
    if (!this.githubToken) {
      throw new Error('GitHub token not configured');
    }

    const response = await fetch(
      `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          labels,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create issue');
    }

    const issue = await response.json();

    return {
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
    };
  }

  /**
   * List recent GitHub issues
   */
  async listIssues() {
    if (!this.githubToken) {
      throw new Error('GitHub token not configured');
    }

    const response = await fetch(
      `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues?state=all&per_page=50`,
      {
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }

    const issues = await response.json();

    return {
      success: true,
      issues: issues.map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        labels: issue.labels.map((l: any) => l.name),
        url: issue.html_url,
        createdAt: issue.created_at,
        closedAt: issue.closed_at,
      })),
    };
  }
}
