import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private seq = 0;

  show(kind: ToastKind, title: string, message?: string, durationMs = 3500): void {
    const id = ++this.seq;
    this._toasts.update(t => [...t, { id, kind, title, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(title: string, message?: string) { this.show('success', title, message); }
  error(title: string, message?: string)   { this.show('error',   title, message); }
  info(title: string, message?: string)    { this.show('info',    title, message); }
  warning(title: string, message?: string) { this.show('warning', title, message); }

  dismiss(id: number): void {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }
}
