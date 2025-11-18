import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request, Req, Headers } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller()
export class SubscriptionsController {
  constructor(private subscriptions: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('users/:id/subscriptions')
  async createCheckout(
    @Param('id') creatorId: string,
    @Body() body: { tier?: string; priceCents?: number },
    @Request() req: any,
  ) {
    return this.subscriptions.createCheckoutSession(
      req.user.userId,
      creatorId,
      body.tier || 'PREMIUM_1000',
      body.priceCents || 100000,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id/subscriptions/me')
  async getStatus(@Param('id') creatorId: string, @Request() req: any) {
    return this.subscriptions.getSubscriptionStatus(req.user.userId, creatorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/my-subscriptions')
  async getMySubscriptions(@Request() req: any) {
    return this.subscriptions.getMySubscriptions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/my-subscribers')
  async getMySubscribers(@Request() req: any) {
    return this.subscriptions.getMySubscribers(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id/subscriptions')
  async cancelSubscription(@Param('id') creatorId: string, @Request() req: any) {
    return this.subscriptions.cancelSubscription(req.user.userId, creatorId);
  }

  @Public()
  @Post('webhooks/stripe')
  async handleWebhook(@Req() req: any, @Headers('stripe-signature') sig: string) {
    const rawBody = req.rawBody || req.body;
    return this.subscriptions.handleStripeWebhook(rawBody, sig);
  }
}

