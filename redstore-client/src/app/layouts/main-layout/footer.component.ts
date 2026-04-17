import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../../data/mock-categories';

@Component({
  selector: 'rs-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="rs-footer">
      <div class="rs-container rs-footer__inner">
        <div class="rs-footer__brand">
          <div class="rs-footer__logo-row">
            <span class="rs-footer__logo">R</span>
            <span class="rs-footer__name">red<span class="rs-gradient-text">store</span></span>
          </div>
          <p>The modern marketplace that connects buyers, sellers and brands — on one beautiful platform.</p>
          <div class="rs-footer__socials" aria-label="Social media">
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="YouTube">▶️</a>
            <a href="#" aria-label="LinkedIn">💼</a>
          </div>
        </div>
        <div class="rs-footer__col">
          <h4>Shop</h4>
          <ul>
            <li *ngFor="let c of categories.slice(0, 6)">
              <a [routerLink]="['/category', c.slug]">{{ c.name }}</a>
            </li>
          </ul>
        </div>
        <div class="rs-footer__col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Contact</a></li>
            <li><a routerLink="/auth/request-seller">Become a seller</a></li>
          </ul>
        </div>
        <div class="rs-footer__col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Help center</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
          </ul>
        </div>

        <div class="rs-footer__newsletter">
          <h4>Join the list</h4>
          <p>Fresh drops, exclusive discounts and insider offers — straight to your inbox.</p>
          <form (submit)="$event.preventDefault()">
            <input type="email" placeholder="your@email.com"/>
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div class="rs-footer__bottom">
        <div class="rs-container rs-footer__bottom-inner">
          <span>© 2026 RedStore. Crafted with care.</span>
          <span>Global shipping · Secure checkout · 30-day returns</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .rs-footer { background: #0a0a0a; color: #e4e4e7; padding-top: 72px; margin-top: 96px; }
    .rs-footer__inner {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1fr 1.6fr;
      gap: 48px;
      padding-bottom: 56px;
    }
    .rs-footer__brand p { color: #a1a1aa; max-width: 320px; margin-top: 12px; line-height: 1.6; font-size: 14px; }
    .rs-footer__logo-row { display: flex; align-items: center; gap: 10px; font-family: var(--rs-font-display); font-weight: 800; font-size: 22px; color: white; }
    .rs-footer__logo {
      width: 38px; height: 38px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      color: white; background: var(--rs-gradient-brand);
      box-shadow: var(--rs-shadow-brand);
    }
    .rs-footer__socials { display: flex; gap: 10px; margin-top: 18px; }
    .rs-footer__socials a {
      width: 38px; height: 38px; border-radius: 50%;
      background: #18181b; display: inline-flex; align-items: center; justify-content: center;
      transition: background var(--rs-dur-fast) var(--rs-ease);
    }
    .rs-footer__socials a:hover { background: #27272a; }

    .rs-footer__col h4, .rs-footer__newsletter h4 {
      font-size: 13px; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: white; margin-bottom: 18px;
    }
    .rs-footer__col ul { display: flex; flex-direction: column; gap: 10px; }
    .rs-footer__col a { color: #a1a1aa; font-size: 14px; transition: color var(--rs-dur-fast) var(--rs-ease); }
    .rs-footer__col a:hover { color: white; }

    .rs-footer__newsletter p { color: #a1a1aa; font-size: 14px; margin-bottom: 16px; line-height: 1.6; }
    .rs-footer__newsletter form {
      display: flex; gap: 8px;
      padding: 6px;
      background: #18181b;
      border-radius: var(--rs-radius-pill);
    }
    .rs-footer__newsletter input {
      flex: 1; min-width: 0;
      padding: 10px 16px;
      background: transparent; border: 0; outline: 0;
      color: white; font-size: 14px;
    }
    .rs-footer__newsletter input::placeholder { color: #71717a; }
    .rs-footer__newsletter button {
      padding: 10px 22px;
      border-radius: var(--rs-radius-pill);
      background: var(--rs-gradient-brand);
      color: white; font-weight: 600; font-size: 13px;
    }

    .rs-footer__bottom {
      border-top: 1px solid #27272a;
      padding: 20px 0;
      color: #71717a;
      font-size: 13px;
    }
    .rs-footer__bottom-inner { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; }

    @media (max-width: 1024px) {
      .rs-footer__inner { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 600px) {
      .rs-footer__inner { grid-template-columns: 1fr; gap: 36px; }
    }
  `],
})
export class FooterComponent {
  categories = CATEGORIES;
}
