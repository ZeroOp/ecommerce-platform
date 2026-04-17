import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'rs-page-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="rs-ph">
      <div class="rs-ph__text">
        <div *ngIf="eyebrow" class="rs-ph__eyebrow">{{ eyebrow }}</div>
        <h1 class="rs-ph__title">{{ title }}</h1>
        <p *ngIf="subtitle" class="rs-ph__sub">{{ subtitle }}</p>
      </div>
      <div class="rs-ph__actions">
        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [`
    .rs-ph {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .rs-ph__eyebrow {
      display: inline-block;
      font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
      color: var(--rs-brand-600);
      margin-bottom: 6px;
    }
    .rs-ph__title { font-size: clamp(22px, 3vw, 30px); font-weight: 800; letter-spacing: -0.035em; }
    .rs-ph__sub { color: var(--rs-text-muted); margin-top: 4px; font-size: 14px; }
    .rs-ph__actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  `],
})
export class PageHeaderComponent {
  @Input() eyebrow?: string;
  @Input() title = '';
  @Input() subtitle?: string;
}
