import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rs-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rs-stat" [style.--stat-accent]="accent">
      <div class="rs-stat__top">
        <div class="rs-stat__label">{{ label }}</div>
        <div class="rs-stat__icon"><rs-icon [name]="icon" [size]="20"></rs-icon></div>
      </div>
      <div class="rs-stat__value">{{ value }}</div>
      <div *ngIf="delta !== undefined" class="rs-stat__delta" [class.is-down]="delta < 0">
        <span>{{ delta > 0 ? '▲' : '▼' }} {{ delta | number: '1.1-1' }}%</span>
        <span class="rs-stat__delta-note" *ngIf="deltaNote">{{ deltaNote }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .rs-stat {
      --stat-accent: var(--rs-brand-600);
      position: relative;
      background: var(--rs-surface);
      padding: 20px 22px;
      border-radius: var(--rs-radius-lg);
      border: 1px solid var(--rs-border);
      box-shadow: var(--rs-shadow-xs);
      overflow: hidden;
      display: flex; flex-direction: column; gap: 8px;
    }
    .rs-stat::before {
      content: ''; position: absolute; right: -30px; top: -30px;
      width: 120px; height: 120px;
      background: var(--stat-accent);
      opacity: 0.09;
      border-radius: 50%;
    }
    .rs-stat__top { display: flex; justify-content: space-between; align-items: center; }
    .rs-stat__label { font-size: 12px; color: var(--rs-text-muted); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
    .rs-stat__icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      background: color-mix(in srgb, var(--stat-accent) 14%, white);
      color: var(--stat-accent);
    }
    .rs-stat__value { font-size: 30px; font-weight: 800; font-family: var(--rs-font-display); letter-spacing: -0.03em; }
    .rs-stat__delta { color: var(--rs-success); font-size: 12px; font-weight: 600; display: flex; gap: 6px; align-items: center; }
    .rs-stat__delta.is-down { color: var(--rs-danger); }
    .rs-stat__delta-note { color: var(--rs-text-subtle); font-weight: 500; }
  `],
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon: any = 'chart';
  @Input() delta?: number;
  @Input() deltaNote?: string;
  @Input() accent = '#e11d48';
}
