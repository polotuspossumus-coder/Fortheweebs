import { notifyDiscord } from './notifyDiscord';

export function globalErrorHandler(err: any, req: any, res: any, next: any) {
  notifyDiscord(err.message);
  res.status(500).json({ error: 'Internal Server Error' });
}
