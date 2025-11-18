import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PostsModule } from './posts/posts.module';
import { StatsModule } from './stats/stats.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { GithubModule } from './github/github.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EventsModule,
    HealthModule,
    AuthModule,
    RelationshipsModule,
    SubscriptionsModule,
    PostsModule,
    StatsModule,
    GithubModule,
  ],
})
export class AppModule {}
