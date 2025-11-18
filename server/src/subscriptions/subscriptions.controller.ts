import { Controller, Post, Get, Delete, Param, Body, Query, UseGuards, Request, RawBodyRequest, Req } from '@nestjs/common';
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
    @Request() req,
  ) {
    return this.subscriptions.createCheckoutSession(
      req.user.sub,
      creatorId,
      body.tier || 'PREMIUM_1000',
      body.priceCents || 100000,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id/subscriptions/me')
  async getStatus(@Param('id') creatorId: string, @Request() req) {
    return this.subscriptions.getSubscriptionStatus(req.user.sub, creatorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/my-subscriptions')
  async getMySubscriptions(@Request() req) {
    return this.subscriptions.getMySubscriptions(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/my-subscribers')
  async getMySubscribers(@Request() req) {
    return this.subscriptions.getMySubscribers(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id/subscriptions')
  async cancelSubscription(@Param('id') creatorId: string, @Request() req) {
    return this.subscriptions.cancelSubscription(req.user.sub, creatorId);
  }

  @Public()
  @Post('webhooks/stripe')
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const sig = req.headers['stripe-signature'];
    return this.subscriptions.handleStripeWebhook(req.rawBody, sig as string);
  }
}
