import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'dark';

@Component({
  selector: 'rs-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="rs-badge" [attr.data-tone]="tone" [class.rs-badge--soft]="soft"><ng-content></ng-content></span>`,
  styles: [`
    .rs-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px;
      font-size: 11px; font-weight: 600;
      border-radius: var(--rs-radius-pill);
      line-height: 1.2;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .rs-badge[data-tone="neutral"] { background: var(--rs-surface-2); color: var(--rs-text); }
    .rs-badge[data-tone="brand"]   { background: var(--rs-brand-600); color: white; }
    .rs-badge[data-tone="success"] { background: #dcfce7; color: #166534; }
    .rs-badge[data-tone="warning"] { background: #fef3c7; color: #92400e; }
    .rs-badge[data-tone="danger"]  { background: #fee2e2; color: #991b1b; }
    .rs-badge[data-tone="info"]    { background: #dbeafe; color: #1e40af; }
    .rs-badge[data-tone="dark"]    { background: #0a0a0a; color: #fff; }

    .rs-badge--soft[data-tone="brand"]   { background: var(--rs-brand-50); color: var(--rs-brand-700); }
  `],
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'neutral';
  @Input() soft = false;
}
