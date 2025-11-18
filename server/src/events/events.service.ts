import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventsService {
  constructor(private eventEmitter: EventEmitter2) {}

  emit(eventName: string, payload: any) {
    this.eventEmitter.emit(eventName, payload);
  }

  on(eventName: string, listener: (payload: any) => void) {
    this.eventEmitter.on(eventName, listener);
  }
}
