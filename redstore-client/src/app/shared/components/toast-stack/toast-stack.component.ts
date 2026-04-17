import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rs-toast-stack',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rs-toasts" aria-live="polite" aria-atomic="true">
      @for (t of toast.toasts(); track t.id) {
        <div class="rs-toast rs-anim-slide" [attr.data-kind]="t.kind">
          <div class="rs-toast__icon">
            <rs-icon
              [name]="t.kind === 'success' ? 'check' : t.kind === 'error' ? 'warning' : t.kind === 'warning' ? 'warning' : 'info'"
              [size]="18"></rs-icon>
          </div>
          <div class="rs-toast__body">
            <div class="rs-toast__title">{{ t.title }}</div>
            <div class="rs-toast__msg" *ngIf="t.message">{{ t.message }}</div>
          </div>
          <button class="rs-toast__close" (click)="toast.dismiss(t.id)" aria-label="Dismiss">
            <rs-icon name="close" [size]="16"></rs-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .rs-toasts {
      position: fixed;
      top: 24px; right: 24px;
      z-index: 1200;
      display: flex; flex-direction: column; gap: 10px;
      pointer-events: none;
    }
    .rs-toast {
      pointer-events: auto;
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px 16px;
      min-width: 280px;
      max-width: 360px;
      background: var(--rs-surface);
      border-radius: var(--rs-radius-md);
      border: 1px solid var(--rs-border);
      box-shadow: var(--rs-shadow-lg);
    }
    .rs-toast__icon {
      width: 32px; height: 32px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      background: var(--rs-surface-2);
    }
    .rs-toast[data-kind="success"] .rs-toast__icon { background: #dcfce7; color: #166534; }
    .rs-toast[data-kind="error"]   .rs-toast__icon { background: #fee2e2; color: #991b1b; }
    .rs-toast[data-kind="warning"] .rs-toast__icon { background: #fef3c7; color: #92400e; }
    .rs-toast[data-kind="info"]    .rs-toast__icon { background: #dbeafe; color: #1e40af; }

    .rs-toast__body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .rs-toast__title { font-weight: 600; font-size: 14px; }
    .rs-toast__msg { font-size: 13px; color: var(--rs-text-muted); }
    .rs-toast__close {
      color: var(--rs-text-subtle);
      padding: 4px;
      border-radius: 8px;
    }
    .rs-toast__close:hover { background: var(--rs-surface-2); color: var(--rs-text); }
  `],
})
export class ToastStackComponent {
  toast = inject(ToastService);
}
