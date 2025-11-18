import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PostsService } from './posts.service';
import { PostsController, UserPostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RelationshipsModule } from '../relationships/relationships.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, RelationshipsModule, SubscriptionsModule, EventsModule, JwtModule.register({})],
  controllers: [PostsController, UserPostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
