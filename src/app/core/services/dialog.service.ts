import { Injectable, signal } from '@angular/core';

export interface DialogRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogState {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly current = signal<DialogState | null>(null);
  private resolver: ((accepted: boolean) => void) | null = null;

  confirm(request: DialogRequest): Promise<boolean> {
    this.finish(false);
    this.current.set({
      title: request.title,
      message: request.message,
      confirmLabel: request.confirmLabel ?? 'Sí',
      cancelLabel: request.cancelLabel ?? 'No',
    });
    return new Promise((resolve) => {
      this.resolver = resolve;
    });
  }

  accept(): void {
    this.finish(true);
  }

  dismiss(): void {
    this.finish(false);
  }

  private finish(accepted: boolean): void {
    const resolve = this.resolver;
    this.resolver = null;
    this.current.set(null);
    resolve?.(accepted);
  }
}
