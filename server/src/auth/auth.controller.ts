import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() body: { email: string; username: string; password: string; displayName?: string }) {
    return this.authService.signup(body);
  }

  @Public()
  @Post('login')
  async login(@Body() body: { emailOrUsername: string; password: string }) {
    return this.authService.login(body.emailOrUsername, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return this.authService.validateUser(req.user.userId);
  }
}

