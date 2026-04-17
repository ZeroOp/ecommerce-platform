import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rs-rating',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="rs-rating" [attr.data-size]="size">
      <rs-icon name="star-filled" [size]="iconSize"></rs-icon>
      <span class="rs-rating__value">{{ value | number: '1.1-1' }}</span>
      <span *ngIf="reviews !== undefined" class="rs-rating__count">({{ reviews | number }})</span>
    </span>
  `,
  styles: [`
    .rs-rating {
      display: inline-flex; align-items: center; gap: 4px;
      color: #f59e0b;
      font-weight: 600;
      font-size: 13px;
    }
    .rs-rating__value { color: var(--rs-text); }
    .rs-rating__count { color: var(--rs-text-subtle); font-weight: 500; margin-left: 2px; }
    .rs-rating[data-size="sm"] { font-size: 12px; }
    .rs-rating[data-size="lg"] { font-size: 15px; }
  `],
})
export class RatingComponent {
  @Input() value = 0;
  @Input() reviews?: number;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  get iconSize() { return this.size === 'lg' ? 18 : this.size === 'sm' ? 14 : 16; }
}
