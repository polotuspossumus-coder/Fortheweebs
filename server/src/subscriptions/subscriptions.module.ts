import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule, JwtModule.register({})],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
