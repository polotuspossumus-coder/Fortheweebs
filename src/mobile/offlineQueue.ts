/* eslint-disable @typescript-eslint/no-explicit-any */
// src/mobile/offlineQueue.ts - Offline request queue for Capacitor
// Optional Capacitor imports - gracefully degrade if not available
let Capacitor: any = { isNativePlatform: () => false };
let Network: any = { 
  addListener: () => ({ remove: () => {} }), 
  getStatus: async () => ({ connected: true }) 
};

// Try to import Capacitor if available (will be undefined in web builds)
if (globalThis.window !== undefined && (globalThis.window as any).Capacitor) {
  Capacitor = (globalThis.window as any).Capacitor;
  Network = (globalThis.window as any).Network;
}

interface QueuedRequest {
  id: string;
  url: string;
  options: Record<string, unknown>;
  timestamp: number;
}

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private readonly storageKey = 'ftw_offline_queue';

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load queue:', error);
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to save queue:', error);
    }
  }

  private setupNetworkListener() {
    if (Capacitor.isNativePlatform()) {
      Network.addListener('networkStatusChange', (status) => {
        if (status.connected) {
          console.log('[OfflineQueue] Network restored, processing queue...');
          this.processQueue();
        }
      });
    } else {
      // Web fallback
      globalThis.addEventListener('online', () => {
        console.log('[OfflineQueue] Network restored, processing queue...');
        this.processQueue();
      });
    }
  }

  async enqueue(url: string, options: Record<string, unknown> = {}) {
    const request: QueuedRequest = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      url,
      options,
      timestamp: Date.now(),
    };

    this.queue.push(request);
    this.saveQueue();

    console.log('[OfflineQueue] Request queued:', request.id);

    // Try to process if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const request = this.queue[0];

      try {
        const response = await fetch(request.url, request.options);

        if (response.ok) {
          console.log('[OfflineQueue] Request successful:', request.id);
          this.queue.shift();
          this.saveQueue();
        } else {
          console.error('[OfflineQueue] Request failed with status:', response.status);
          // Keep in queue for retry
          break;
        }
      } catch (error) {
        console.error('[OfflineQueue] Request error:', error);
        // Keep in queue for retry
        break;
      }
    }

    this.isProcessing = false;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineQueue = new OfflineQueue();
