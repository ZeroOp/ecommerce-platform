import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';

export interface DashNavItem {
  label: string;
  icon: IconName;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'rs-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rs-dash" [class.is-collapsed]="collapsed()">
      <aside class="rs-dash__sidebar">
        <a class="rs-dash__brand" routerLink="/">
          <span class="rs-dash__logo">R</span>
          <span class="rs-dash__brand-text">red<span class="rs-gradient-text">store</span></span>
        </a>

        <div class="rs-dash__context">
          <div class="rs-dash__context-dot" [style.background]="accent"></div>
          <div class="rs-dash__context-body">
            <div class="rs-dash__context-label">{{ contextLabel }}</div>
            <div class="rs-dash__context-sub">{{ contextSub }}</div>
          </div>
        </div>

        <nav class="rs-dash__nav">
          <a *ngFor="let item of nav"
             [routerLink]="item.route"
             [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
             routerLinkActive="is-active"
             class="rs-dash__nav-item">
            <rs-icon [name]="item.icon" [size]="18"></rs-icon>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <div class="rs-dash__sidebar-foot">
          <a class="rs-dash__nav-item" routerLink="/">
            <rs-icon name="arrow-up-right" [size]="18"></rs-icon>
            <span>View store</span>
          </a>
          <button type="button" class="rs-dash__nav-item rs-dash__nav-item--danger" (click)="signOut()">
            <rs-icon name="logout" [size]="18"></rs-icon>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div class="rs-dash__main">
        <header class="rs-dash__topbar">
          <button class="rs-dash__toggle" (click)="toggle()" aria-label="Toggle sidebar">
            <rs-icon name="menu" [size]="20"></rs-icon>
          </button>
          <div class="rs-dash__search">
            <rs-icon name="search" [size]="16"></rs-icon>
            <input type="search" placeholder="Search orders, products, customers..." />
          </div>
          <div class="rs-dash__top-actions">
            <button class="rs-dash__icon-btn" aria-label="Notifications">
              <rs-icon name="bell" [size]="18"></rs-icon>
              <span class="rs-dash__dot"></span>
            </button>
            <div class="rs-dash__user" *ngIf="auth.user() as u">
              <img *ngIf="u.avatar" [src]="u.avatar" [alt]="u.email" />
              <div>
                <div class="rs-dash__user-name">{{ u.name || u.email }}</div>
                <div class="rs-dash__user-role">{{ u.role | titlecase }}</div>
              </div>
            </div>
          </div>
        </header>

        <section class="rs-dash__content">
          <router-outlet></router-outlet>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--rs-surface-2); }
    .rs-dash {
      display: grid;
      grid-template-columns: var(--rs-sidebar-w) 1fr;
      min-height: 100vh;
      transition: grid-template-columns var(--rs-dur) var(--rs-ease);
    }
    .rs-dash.is-collapsed { grid-template-columns: 84px 1fr; }

    .rs-dash__sidebar {
      position: sticky; top: 0; align-self: start;
      height: 100vh;
      background: #0a0a0a;
      color: #e4e4e7;
      padding: 24px 16px;
      display: flex; flex-direction: column; gap: 16px;
      overflow-y: auto;
      z-index: 40;
    }

    .rs-dash__brand {
      display: inline-flex; align-items: center; gap: 10px;
      font-family: var(--rs-font-display); font-weight: 800; font-size: 20px; color: white;
      padding: 4px 8px;
    }
    .rs-dash__logo {
      width: 36px; height: 36px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--rs-gradient-brand);
      box-shadow: var(--rs-shadow-brand);
    }
    .rs-dash.is-collapsed .rs-dash__brand-text { display: none; }

    .rs-dash__context {
      display: flex; align-items: center; gap: 12px;
      padding: 12px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: var(--rs-radius-md);
    }
    .rs-dash__context-dot { width: 32px; height: 32px; border-radius: 10px; }
    .rs-dash__context-body { flex: 1; min-width: 0; }
    .rs-dash__context-label { font-size: 13px; font-weight: 700; color: white; }
    .rs-dash__context-sub { font-size: 11px; color: #71717a; }
    .rs-dash.is-collapsed .rs-dash__context-body { display: none; }

    .rs-dash__nav {
      display: flex; flex-direction: column; gap: 2px;
      flex: 1;
      padding-top: 8px;
    }
    .rs-dash__nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 14px;
      color: #a1a1aa;
      transition: background var(--rs-dur-fast) var(--rs-ease), color var(--rs-dur-fast) var(--rs-ease);
      text-align: left; width: 100%;
    }
    .rs-dash__nav-item:hover { background: #18181b; color: white; }
    .rs-dash__nav-item.is-active {
      background: rgba(244,63,94,0.14);
      color: var(--rs-brand-400);
      font-weight: 600;
      box-shadow: inset 2px 0 0 var(--rs-brand-500);
    }
    .rs-dash.is-collapsed .rs-dash__nav-item span { display: none; }

    .rs-dash__sidebar-foot {
      display: flex; flex-direction: column; gap: 2px;
      padding-top: 12px;
      border-top: 1px solid #27272a;
    }
    .rs-dash__nav-item--danger { color: #f87171; }
    .rs-dash__nav-item--danger:hover { background: rgba(248,113,113,0.1); color: #fca5a5; }

    .rs-dash__main { display: flex; flex-direction: column; min-width: 0; }

    .rs-dash__topbar {
      position: sticky; top: 0; z-index: 30;
      display: flex; align-items: center; gap: 12px;
      padding: 14px 28px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: saturate(180%) blur(12px);
      border-bottom: 1px solid var(--rs-border);
    }
    .rs-dash__toggle {
      width: 40px; height: 40px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--rs-text);
    }
    .rs-dash__toggle:hover { background: var(--rs-surface-2); }
    .rs-dash__search {
      display: flex; align-items: center; gap: 10px;
      padding: 0 14px; height: 42px;
      background: var(--rs-surface-2); border-radius: var(--rs-radius-pill);
      flex: 0 1 420px;
      color: var(--rs-text-subtle);
    }
    .rs-dash__search:focus-within { background: var(--rs-surface); box-shadow: var(--rs-shadow-sm); }
    .rs-dash__search input {
      flex: 1; background: transparent; border: 0; outline: 0; color: var(--rs-text); font-size: 13px;
    }

    .rs-dash__top-actions { margin-left: auto; display: flex; align-items: center; gap: 14px; }
    .rs-dash__icon-btn {
      position: relative;
      width: 40px; height: 40px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--rs-text);
    }
    .rs-dash__icon-btn:hover { background: var(--rs-surface-2); }
    .rs-dash__dot {
      position: absolute; top: 9px; right: 10px;
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--rs-brand-500);
      border: 2px solid var(--rs-surface);
    }

    .rs-dash__user { display: flex; align-items: center; gap: 10px; }
    .rs-dash__user img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
    .rs-dash__user-name { font-size: 13px; font-weight: 700; }
    .rs-dash__user-role { font-size: 11px; color: var(--rs-text-subtle); }

    .rs-dash__content { padding: 28px; }

    @media (max-width: 900px) {
      .rs-dash { grid-template-columns: 0 1fr; }
      .rs-dash__sidebar { display: none; }
    }
  `],
})
export class DashboardLayoutComponent {
  @Input({ required: true }) nav: DashNavItem[] = [];
  @Input() contextLabel = 'Workspace';
  @Input() contextSub = '';
  @Input() accent = 'var(--rs-gradient-brand)';

  auth = inject(AuthService);
  router = inject(Router);
  collapsed = signal(false);

  toggle() { this.collapsed.update(v => !v); }
  signOut() { this.auth.logoutLocal(); }
}
