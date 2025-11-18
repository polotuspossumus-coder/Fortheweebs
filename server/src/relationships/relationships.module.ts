import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RelationshipsService } from './relationships.service';
import { RelationshipsController } from './relationships.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule, JwtModule.register({})],
  controllers: [RelationshipsController],
  providers: [RelationshipsService],
  exports: [RelationshipsService],
})
export class RelationshipsModule {}
