import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsService {
  emit(event: string, data: any) {
    // Emit event (WebSocket/SSE implementation)
    console.log(`Event [${event}]:`, data);
  }

  async emitSubscriptionCreated(data: any) {
    this.emit('subscription.created', data);
  }

  async emitSubscriptionUpdated(data: any) {
    this.emit('subscription.updated', data);
  }

  async emitSubscriptionCancelled(data: any) {
    this.emit('subscription.cancelled', data);
  }
}
