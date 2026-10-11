import { Injectable, signal } from '@angular/core';

export type NoticeType = 'success' | 'info' | 'warning' | 'error';

export interface Notice {
  id: number;
  type: NoticeType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private sequence = 0;
  private readonly timers = new Map<number, number>();
  readonly items = signal<Notice[]>([]);

  show(type: NoticeType, message: string): void {
    const id = ++this.sequence;
    this.items.update((items) => [...items, { id, type, message }]);
    const timerId = window.setTimeout(() => this.dismiss(id), 4200);
    this.timers.set(id, timerId);
  }

  dismiss(id: number): void {
    const timerId = this.timers.get(id);
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      this.timers.delete(id);
    }
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  clear(): void {
    for (const timerId of this.timers.values()) {
      window.clearTimeout(timerId);
    }
    this.timers.clear();
    this.items.set([]);
  }
}
