import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName =
  | 'search' | 'cart' | 'user' | 'heart' | 'menu' | 'close' | 'chevron-down' | 'chevron-right'
  | 'chevron-left' | 'chevron-up' | 'star' | 'star-filled' | 'bag' | 'bell' | 'settings'
  | 'home' | 'box' | 'tag' | 'truck' | 'chart' | 'users' | 'logout' | 'plus' | 'minus'
  | 'edit' | 'trash' | 'eye' | 'eye-off' | 'filter' | 'sparkle' | 'arrow-right' | 'arrow-up-right'
  | 'check' | 'info' | 'warning' | 'shield' | 'zap' | 'package' | 'dollar' | 'globe'
  | 'dashboard' | 'list' | 'grid' | 'more' | 'download' | 'upload' | 'image';

@Component({
  selector: 'rs-icon',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="true"
      [ngSwitch]="name">
      <ng-container *ngSwitchCase="'search'">
        <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
      </ng-container>
      <ng-container *ngSwitchCase="'cart'">
        <circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>
        <path d="M2 3h3l2.6 12.6a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6"/>
      </ng-container>
      <ng-container *ngSwitchCase="'user'">
        <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
      </ng-container>
      <ng-container *ngSwitchCase="'heart'">
        <path d="M20.8 6.6a5 5 0 0 0-8.8-2.1 5 5 0 0 0-8.8 2.1c-1.1 4 2.6 7.6 8.8 12 6.2-4.4 9.9-8 8.8-12Z"/>
      </ng-container>
      <ng-container *ngSwitchCase="'menu'">
        <path d="M4 6h16M4 12h16M4 18h16"/>
      </ng-container>
      <ng-container *ngSwitchCase="'close'">
        <path d="M6 6l12 12M6 18L18 6"/>
      </ng-container>
      <ng-container *ngSwitchCase="'chevron-down'"><path d="m6 9 6 6 6-6"/></ng-container>
      <ng-container *ngSwitchCase="'chevron-up'"><path d="m6 15 6-6 6 6"/></ng-container>
      <ng-container *ngSwitchCase="'chevron-right'"><path d="m9 6 6 6-6 6"/></ng-container>
      <ng-container *ngSwitchCase="'chevron-left'"><path d="m15 6-6 6 6 6"/></ng-container>
      <ng-container *ngSwitchCase="'star'">
        <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3Z"/>
      </ng-container>
      <ng-container *ngSwitchCase="'star-filled'">
        <path fill="currentColor" d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3Z"/>
      </ng-container>
      <ng-container *ngSwitchCase="'bag'">
        <path d="M6 8h12l-1.4 11a2 2 0 0 1-2 1.8H9.4A2 2 0 0 1 7.4 19L6 8Z"/>
        <path d="M9 8a3 3 0 0 1 6 0"/>
      </ng-container>
      <ng-container *ngSwitchCase="'bell'">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z"/>
        <path d="M10 20a2 2 0 0 0 4 0"/>
      </ng-container>
      <ng-container *ngSwitchCase="'settings'">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>
      </ng-container>
      <ng-container *ngSwitchCase="'home'"><path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9Z"/></ng-container>
      <ng-container *ngSwitchCase="'box'"><path d="m21 8-9-5-9 5 9 5 9-5Zm0 0v8l-9 5-9-5V8"/></ng-container>
      <ng-container *ngSwitchCase="'tag'"><path d="M20 12 12 20a2 2 0 0 1-2.8 0L3 13.8V4h9.8L20 11.2a2 2 0 0 1 0 .8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></ng-container>
      <ng-container *ngSwitchCase="'truck'"><path d="M3 6h12v11H3zM15 10h5l2 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></ng-container>
      <ng-container *ngSwitchCase="'chart'"><path d="M3 21h18M6 17V9m5 8V5m5 12v-6m5 6v-3"/></ng-container>
      <ng-container *ngSwitchCase="'users'"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 11a3.5 3.5 0 1 0 0-7M22 21a6 6 0 0 0-4-5.7"/></ng-container>
      <ng-container *ngSwitchCase="'logout'"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17-5-5 5-5M15 12H4"/></ng-container>
      <ng-container *ngSwitchCase="'plus'"><path d="M12 5v14M5 12h14"/></ng-container>
      <ng-container *ngSwitchCase="'minus'"><path d="M5 12h14"/></ng-container>
      <ng-container *ngSwitchCase="'edit'"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></ng-container>
      <ng-container *ngSwitchCase="'trash'"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></ng-container>
      <ng-container *ngSwitchCase="'eye'"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></ng-container>
      <ng-container *ngSwitchCase="'eye-off'"><path d="M17.9 17.9C16.1 19.2 14.1 20 12 20 5 20 1 12 1 12a16 16 0 0 1 4-5.2m4-2.7a9 9 0 0 1 3-.6c7 0 11 8 11 8a16 16 0 0 1-2.3 3.4M9.9 4.2 1 13"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88M1 1l22 22"/></ng-container>
      <ng-container *ngSwitchCase="'filter'"><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z"/></ng-container>
      <ng-container *ngSwitchCase="'sparkle'"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></ng-container>
      <ng-container *ngSwitchCase="'arrow-right'"><path d="M5 12h14M13 6l6 6-6 6"/></ng-container>
      <ng-container *ngSwitchCase="'arrow-up-right'"><path d="M7 17 17 7M9 7h8v8"/></ng-container>
      <ng-container *ngSwitchCase="'check'"><path d="m5 13 4 4L19 7"/></ng-container>
      <ng-container *ngSwitchCase="'info'"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></ng-container>
      <ng-container *ngSwitchCase="'warning'"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/></ng-container>
      <ng-container *ngSwitchCase="'shield'"><path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z"/></ng-container>
      <ng-container *ngSwitchCase="'zap'"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></ng-container>
      <ng-container *ngSwitchCase="'package'"><path d="m21 8-9-5-9 5 9 5 9-5Zm0 0v8l-9 5-9-5V8"/><path d="M3.3 7 12 12l8.7-5"/></ng-container>
      <ng-container *ngSwitchCase="'dollar'"><path d="M12 2v20"/><path d="M17 6H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H7"/></ng-container>
      <ng-container *ngSwitchCase="'globe'"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></ng-container>
      <ng-container *ngSwitchCase="'dashboard'"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></ng-container>
      <ng-container *ngSwitchCase="'list'"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></ng-container>
      <ng-container *ngSwitchCase="'grid'"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></ng-container>
      <ng-container *ngSwitchCase="'more'"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></ng-container>
      <ng-container *ngSwitchCase="'download'"><path d="M12 3v13M6 11l6 6 6-6M5 21h14"/></ng-container>
      <ng-container *ngSwitchCase="'upload'"><path d="M12 21V8M6 13l6-6 6 6M5 3h14"/></ng-container>
      <ng-container *ngSwitchCase="'image'"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></ng-container>
    </svg>
  `,
  styles: [`:host{display:inline-flex;align-items:center;justify-content:center}`],
})
export class IconComponent {
  @Input() name!: IconName;
  @Input() size: number | string = 20;
  @Input() strokeWidth: number = 1.8;
}
