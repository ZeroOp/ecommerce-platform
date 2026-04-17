import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'rs-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [attr.type]="type"
      [disabled]="disabled || loading"
      [class]="'rs-btn rs-btn--' + variant + ' rs-btn--' + size + (block ? ' rs-btn--block' : '') + (loading ? ' rs-btn--loading' : '')">
      <span class="rs-btn__inner">
        <ng-content select="[slot=icon]"></ng-content>
        <ng-content></ng-content>
      </span>
      <span class="rs-btn__spinner" *ngIf="loading" aria-hidden="true"></span>
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
    :host([block]) { display: block; width: 100%; }

    .rs-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: inherit;
      font-weight: 600;
      letter-spacing: -0.005em;
      border-radius: var(--rs-radius-pill);
      border: 1px solid transparent;
      transition: transform var(--rs-dur-fast) var(--rs-ease),
                  background var(--rs-dur-fast) var(--rs-ease),
                  box-shadow var(--rs-dur-fast) var(--rs-ease),
                  color var(--rs-dur-fast) var(--rs-ease);
      will-change: transform;
      white-space: nowrap;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .rs-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .rs-btn:not(:disabled):hover { transform: translateY(-1px); }
    .rs-btn:not(:disabled):active { transform: translateY(0); }

    .rs-btn__inner { display: inline-flex; align-items: center; gap: 8px; }

    .rs-btn--block { width: 100%; }

    /* Sizes */
    .rs-btn--sm { height: 36px; padding: 0 14px; font-size: 13px; }
    .rs-btn--md { height: 44px; padding: 0 20px; font-size: 14px; }
    .rs-btn--lg { height: 52px; padding: 0 28px; font-size: 15px; }

    /* Primary (brand gradient) */
    .rs-btn--primary {
      color: var(--rs-text-on-brand);
      background: var(--rs-gradient-brand);
      box-shadow: var(--rs-shadow-brand);
    }
    .rs-btn--primary:not(:disabled):hover {
      box-shadow: 0 16px 32px -10px rgba(225, 29, 72, 0.55);
      filter: saturate(1.1);
    }

    /* Secondary */
    .rs-btn--secondary {
      background: var(--rs-surface-2);
      color: var(--rs-text);
      border-color: var(--rs-border);
    }
    .rs-btn--secondary:not(:disabled):hover { background: var(--rs-surface-3); }

    /* Dark */
    .rs-btn--dark {
      background: #0a0a0a;
      color: #fff;
    }
    .rs-btn--dark:not(:disabled):hover { background: #1a1a1a; }

    /* Ghost */
    .rs-btn--ghost {
      background: transparent;
      color: var(--rs-text);
    }
    .rs-btn--ghost:not(:disabled):hover { background: var(--rs-surface-2); }

    /* Outline */
    .rs-btn--outline {
      background: transparent;
      color: var(--rs-text);
      border-color: var(--rs-border-strong);
    }
    .rs-btn--outline:not(:disabled):hover {
      border-color: var(--rs-brand-500);
      color: var(--rs-brand-600);
      background: var(--rs-brand-50);
    }

    /* Danger */
    .rs-btn--danger {
      background: #fff;
      color: var(--rs-danger);
      border-color: #fecaca;
    }
    .rs-btn--danger:not(:disabled):hover { background: #fef2f2; }

    /* Success */
    .rs-btn--success {
      background: var(--rs-accent-500);
      color: #fff;
    }

    .rs-btn--loading .rs-btn__inner { opacity: 0; }
    .rs-btn__spinner {
      position: absolute;
      width: 18px; height: 18px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: rs-spin 0.8s linear infinite;
    }
    @keyframes rs-spin { to { transform: rotate(360deg); } }
  `],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() block = false;
}
