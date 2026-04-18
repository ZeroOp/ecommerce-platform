import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryApiService, CategoryApiResponse } from '../../core/services/category-api.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'rs-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="rs-header" [class.is-scrolled]="scrolled()">
      <div class="rs-container rs-header__inner">
        <a class="rs-header__brand" routerLink="/">
          <span class="rs-header__logo">R</span>
          <span class="rs-header__brand-text">red<span class="rs-gradient-text">store</span></span>
        </a>

        <nav class="rs-header__nav" aria-label="Primary">
          <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <div class="rs-header__dropdown">
            <button type="button" class="rs-header__nav-btn">
              Categories <rs-icon name="chevron-down" [size]="14"></rs-icon>
            </button>
            <div class="rs-header__menu">
              <a *ngFor="let c of parentCategories()" [routerLink]="['/category', c.slug]">
                <span class="rs-header__menu-icon">
                  <img *ngIf="c.iconUrl" [src]="c.iconUrl" [alt]="" />
                  <ng-container *ngIf="!c.iconUrl">{{ c.icon ?? '📁' }}</ng-container>
                </span>
                <span>
                  <span class="rs-header__menu-title">{{ c.name }}</span>
                  <span class="rs-header__menu-sub">Browse category</span>
                </span>
              </a>
            </div>
          </div>
          <a routerLink="/deals" routerLinkActive="is-active">Deals</a>
          <a routerLink="/auth/request-seller" routerLinkActive="is-active">Sell on RedStore</a>
        </nav>

        <form class="rs-header__search" (submit)="onSearchSubmit($event)">
          <rs-icon name="search" [size]="18"></rs-icon>
          <input
            #searchInput
            type="search"
            name="q"
            autocomplete="off"
            placeholder="Search products, brands, categories..."
            [value]="searchTerm()"
          />
          <kbd>⌘K</kbd>
        </form>

        <div class="rs-header__actions">
          <a class="rs-header__icon-btn" routerLink="/cart" aria-label="Cart">
            <rs-icon name="cart" [size]="20"></rs-icon>
            <span *ngIf="cart.count() > 0" class="rs-header__badge">{{ cart.count() }}</span>
          </a>

          <ng-container *ngIf="auth.user() as user; else loggedOut">
            <div class="rs-header__dropdown rs-header__dropdown--right">
              <button type="button" class="rs-header__avatar">
                <img *ngIf="user.avatar" [src]="user.avatar" [alt]="user.email" />
                <span *ngIf="!user.avatar">{{ user.email.charAt(0).toUpperCase() }}</span>
              </button>
              <div class="rs-header__menu rs-header__menu--narrow">
                <div class="rs-header__menu-head">
                  <div class="rs-header__menu-title">{{ user.name || user.email }}</div>
                  <div class="rs-header__menu-sub">{{ user.email }}</div>
                </div>
                <a routerLink="/profile"><rs-icon name="user" [size]="16"></rs-icon> Profile</a>
                <a routerLink="/orders"><rs-icon name="box" [size]="16"></rs-icon> My Orders</a>
                <a *ngIf="user.role === 'seller'" routerLink="/seller"><rs-icon name="dashboard" [size]="16"></rs-icon> Seller Dashboard</a>
                <a *ngIf="user.role === 'admin'" routerLink="/admin"><rs-icon name="shield" [size]="16"></rs-icon> Admin Console</a>
                <button type="button" class="rs-header__menu-danger" (click)="auth.logout()">
                  <rs-icon name="logout" [size]="16"></rs-icon> Sign out
                </button>
              </div>
            </div>
          </ng-container>
          <ng-template #loggedOut>
            <a class="rs-header__signin" routerLink="/auth/signin">
              <rs-icon name="user" [size]="16"></rs-icon> Sign in
            </a>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .rs-header {
      position: sticky; top: 0; z-index: 100;
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: saturate(180%) blur(14px);
      border-bottom: 1px solid transparent;
      transition: border-color var(--rs-dur-fast) var(--rs-ease), box-shadow var(--rs-dur-fast) var(--rs-ease);
    }
    .rs-header.is-scrolled {
      border-bottom-color: var(--rs-border);
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.04);
    }
    .rs-header__inner {
      height: var(--rs-nav-h);
      display: flex; align-items: center; gap: 20px;
    }
    .rs-header__brand {
      display: inline-flex; align-items: center; gap: 10px;
      font-family: var(--rs-font-display); font-weight: 800; font-size: 20px;
      letter-spacing: -0.03em;
    }
    .rs-header__logo {
      width: 36px; height: 36px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      color: white; background: var(--rs-gradient-brand);
      box-shadow: var(--rs-shadow-brand);
      font-weight: 800;
    }
    .rs-header__brand-text { letter-spacing: -0.03em; }

    .rs-header__nav {
      display: flex; gap: 4px; align-items: center; flex: 1;
      margin-left: 10px;
    }
    .rs-header__nav a, .rs-header__nav-btn {
      padding: 8px 14px; border-radius: var(--rs-radius-pill);
      font-size: 14px; font-weight: 500;
      color: var(--rs-text-muted);
      display: inline-flex; align-items: center; gap: 4px;
      cursor: pointer;
      transition: color var(--rs-dur-fast) var(--rs-ease), background var(--rs-dur-fast) var(--rs-ease);
    }
    .rs-header__nav a:hover, .rs-header__nav-btn:hover {
      color: var(--rs-text);
      background: var(--rs-surface-2);
    }
    .rs-header__nav a.is-active { color: var(--rs-brand-600); }

    .rs-header__dropdown { position: relative; }
    .rs-header__menu {
      position: absolute; top: calc(100% + 8px); left: 0;
      min-width: 300px;
      background: var(--rs-surface);
      border-radius: var(--rs-radius-lg);
      box-shadow: var(--rs-shadow-lg);
      border: 1px solid var(--rs-border);
      padding: 8px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-6px);
      transition: opacity var(--rs-dur-fast) var(--rs-ease),
                  transform var(--rs-dur-fast) var(--rs-ease);
      z-index: 120;
    }
    .rs-header__menu--narrow { min-width: 240px; }
    .rs-header__dropdown:hover .rs-header__menu,
    .rs-header__dropdown:focus-within .rs-header__menu {
      opacity: 1; visibility: visible; transform: translateY(0);
    }
    .rs-header__dropdown--right .rs-header__menu { left: auto; right: 0; }
    .rs-header__menu a, .rs-header__menu button {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 10px;
      font-size: 14px; color: var(--rs-text);
      width: 100%; text-align: left;
    }
    .rs-header__menu a:hover, .rs-header__menu button:hover { background: var(--rs-surface-2); }
    .rs-header__menu-icon { font-size: 20px; display: inline-flex; align-items: center; justify-content: center; }
    .rs-header__menu-icon img { width: 28px; height: 28px; object-fit: cover; border-radius: 8px; }
    .rs-header__menu-title { font-weight: 600; font-size: 14px; color: var(--rs-text); display: block; }
    .rs-header__menu-sub { font-size: 12px; color: var(--rs-text-subtle); display: block; }
    .rs-header__menu-head {
      padding: 10px 12px 12px;
      border-bottom: 1px solid var(--rs-border);
      margin-bottom: 6px;
    }
    .rs-header__menu-danger { color: var(--rs-danger) !important; }
    .rs-header__menu-danger:hover { background: #fee2e2 !important; }

    .rs-header__search {
      flex: 0 1 380px;
      display: flex; align-items: center; gap: 10px;
      padding: 0 14px;
      background: var(--rs-surface-2);
      border-radius: var(--rs-radius-pill);
      height: 42px;
      color: var(--rs-text-subtle);
      transition: background var(--rs-dur-fast) var(--rs-ease), box-shadow var(--rs-dur-fast) var(--rs-ease);
    }
    .rs-header__search:focus-within { background: var(--rs-surface); box-shadow: var(--rs-shadow-sm); }
    .rs-header__search input {
      flex: 1;
      background: transparent;
      border: 0; outline: 0;
      font-size: 14px;
      color: var(--rs-text);
    }
    .rs-header__search kbd {
      padding: 3px 6px;
      font-size: 11px;
      font-family: var(--rs-font-sans);
      background: var(--rs-surface);
      border: 1px solid var(--rs-border);
      border-radius: 6px;
      color: var(--rs-text-subtle);
    }

    .rs-header__actions { display: flex; align-items: center; gap: 8px; }
    .rs-header__icon-btn {
      position: relative;
      width: 42px; height: 42px;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%;
      color: var(--rs-text);
      transition: background var(--rs-dur-fast) var(--rs-ease);
    }
    .rs-header__icon-btn:hover { background: var(--rs-surface-2); }
    .rs-header__badge {
      position: absolute; top: 4px; right: 4px;
      min-width: 18px; height: 18px;
      padding: 0 5px;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--rs-brand-600); color: white;
      font-size: 10px; font-weight: 700;
      border-radius: 999px;
      border: 2px solid var(--rs-surface);
    }
    .rs-header__avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: var(--rs-gradient-brand);
      color: white;
      font-weight: 700;
      display: inline-flex; align-items: center; justify-content: center;
      overflow: hidden;
      cursor: pointer;
      box-shadow: var(--rs-shadow-sm);
    }
    .rs-header__avatar img { width: 100%; height: 100%; object-fit: cover; }
    .rs-header__signin {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 16px; height: 40px;
      border-radius: var(--rs-radius-pill);
      background: #0a0a0a; color: white;
      font-size: 13px; font-weight: 600;
    }
    .rs-header__signin:hover { background: #1a1a1a; }

    @media (max-width: 960px) {
      .rs-header__nav, .rs-header__search { display: none; }
    }
  `],
})
export class HeaderComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);
  private categoryApi = inject(CategoryApiService);

  parentCategories = toSignal(
    this.categoryApi.getCategories().pipe(
      map((rows) => rows.filter((c) => !c.parentCategoryId)),
      catchError(() => of([] as CategoryApiResponse[])),
    ),
    { initialValue: [] as CategoryApiResponse[] },
  );

  scrolled = signal(false);
  searchTerm = signal('');

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 4);
  }

  onSearchSubmit(event: Event) {
    event.preventDefault();
    const input = (event.target as HTMLFormElement)?.querySelector<HTMLInputElement>('input[name="q"]');
    const q = (input?.value ?? '').trim();
    this.searchTerm.set(q);
    this.router.navigate(['/search'], { queryParams: q ? { q } : {} });
  }
}
