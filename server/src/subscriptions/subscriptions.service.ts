import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createCheckoutSession(
    subscriberId: string,
    creatorId: string,
    tier: string = 'BASIC',
    priceCents: number = 100000, // $1000 default
  ) {
    if (subscriberId === creatorId) {
      throw new BadRequestException('Cannot subscribe to yourself');
    }

    // Check if already subscribed
    const existing = await this.prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: { subscriberId, creatorId },
      },
    });

    if (existing && existing.status === 'ACTIVE') {
      throw new BadRequestException('Already subscribed');
    }

    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId },
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // One-time payment for $1000 tier
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier} Subscription to ${creator.displayName || creator.username}`,
              description: 'Full access to creator content and features',
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?subscription=canceled`,
      metadata: {
        subscriberId,
        creatorId,
        tier,
      },
    });

    return { sessionUrl: session.url, sessionId: session.id };
  }

  async activateSubscription(
    subscriberId: string,
    creatorId: string,
    stripeSessionId: string,
    tier: string = 'BASIC',
    priceCents: number = 100000,
  ) {
    const subscription = await this.prisma.subscription.upsert({
      where: {
        subscriberId_creatorId: { subscriberId, creatorId },
      },
      create: {
        subscriberId,
        creatorId,
        tier,
        status: 'ACTIVE',
        stripeSessionId,
        priceCents,
        expiresAt: null, // Lifetime for $1000 tier
      },
      update: {
        status: 'ACTIVE',
        stripeSessionId,
        tier,
        priceCents,
        expiresAt: null,
      },
    });

    this.events.emit('subscription.activated', {
      subscriberId,
      creatorId,
      subscriptionId: subscription.id,
      tier,
      timestamp: new Date(),
    });

    return subscription;
  }

  async cancelSubscription(subscriberId: string, creatorId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: { subscriberId, creatorId },
      },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELED' },
    });

    this.events.emit('subscription.canceled', {
      subscriberId,
      creatorId,
      subscriptionId: subscription.id,
      timestamp: new Date(),
    });

    return updated;
  }

  async getSubscriptionStatus(subscriberId: string, creatorId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: { subscriberId, creatorId },
      },
    });

    return {
      isSubscribed: subscription?.status === 'ACTIVE',
      subscription,
    };
  }

  async getMySubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: {
        subscriberId: userId,
        status: 'ACTIVE',
      },
      include: {
        creator: {
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

  async getMySubscribers(creatorId: string) {
    return this.prisma.subscription.findMany({
      where: {
        creatorId,
        status: 'ACTIVE',
      },
      include: {
        subscriber: {
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

  async hasActiveSubscription(subscriberId: string, creatorId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        subscriberId,
        creatorId,
        status: 'ACTIVE',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    return !!subscription;
  }

  async handleStripeWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { subscriberId, creatorId, tier } = session.metadata;
        
        await this.activateSubscription(
          subscriberId,
          creatorId,
          session.id,
          tier,
          session.amount_total,
        );
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription cancellation from Stripe
        break;
      }
    }

    return { received: true };
  }
}
