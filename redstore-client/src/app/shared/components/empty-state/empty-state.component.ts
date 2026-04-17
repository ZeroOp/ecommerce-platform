import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rs-empty',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rs-empty">
      <div class="rs-empty__art">
        <rs-icon [name]="icon" [size]="36"></rs-icon>
      </div>
      <h3 class="rs-empty__title">{{ title }}</h3>
      <p class="rs-empty__msg" *ngIf="message">{{ message }}</p>
      <div class="rs-empty__cta">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .rs-empty {
      display: flex; flex-direction: column; align-items: center;
      text-align: center;
      padding: 48px 24px;
      gap: 10px;
    }
    .rs-empty__art {
      width: 76px; height: 76px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: var(--rs-gradient-mesh), var(--rs-surface);
      color: var(--rs-brand-600);
      margin-bottom: 6px;
      box-shadow: var(--rs-shadow-sm);
    }
    .rs-empty__title { font-size: 18px; }
    .rs-empty__msg { color: var(--rs-text-muted); max-width: 380px; }
    .rs-empty__cta { margin-top: 8px; }
  `],
})
export class EmptyStateComponent {
  @Input() icon: any = 'sparkle';
  @Input() title = 'Nothing here yet';
  @Input() message?: string;
}
