import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'rs-request-seller',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, InputComponent, ButtonComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="rs-card rs-anim-fade">
      <rs-badge tone="brand" [soft]="true">Become a seller</rs-badge>
      <h1>Grow your brand on RedStore.</h1>
      <p class="rs-card__sub">
        Join 120k+ sellers reaching millions of buyers worldwide. Tell us about your business — we usually respond in under 48 hours.
      </p>

      <div class="rs-perks">
        <div><rs-icon name="globe" [size]="18"></rs-icon> Global reach, instant exposure</div>
        <div><rs-icon name="zap" [size]="18"></rs-icon> Low fees, fast payouts</div>
        <div><rs-icon name="shield" [size]="18"></rs-icon> Seller protection built in</div>
      </div>

      <form class="rs-form" (submit)="submit($event)">
        <div class="rs-form__row"><rs-input label="Business name" placeholder="RedStore Apparel Co."></rs-input></div>
        <div class="rs-form__row rs-form__row--2">
          <rs-input label="Your name" placeholder="Jane Doe"></rs-input>
          <rs-input label="Work email" type="email" placeholder="you@company.com"></rs-input>
        </div>
        <div class="rs-form__row rs-form__row--2">
          <rs-input label="Country" placeholder="United States"></rs-input>
          <rs-input label="Primary category" placeholder="Fashion, Electronics, ..."></rs-input>
        </div>
        <div class="rs-form__row"><rs-input label="Tell us about your business" placeholder="What do you sell? Annual revenue? Why join RedStore?"></rs-input></div>
        <rs-button type="submit" variant="primary" size="lg" [block]="true" [loading]="submitting()">
          Submit application
        </rs-button>
      </form>

      <div class="rs-card__foot">
        Already approved? <a routerLink="/auth/seller-signin">Sign in to Seller Hub</a>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .rs-card {
      width: 100%; max-width: 520px;
      background: var(--rs-surface);
      border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-xl);
      padding: 40px;
      box-shadow: var(--rs-shadow-lg);
      margin: 0 auto;
      display: flex; flex-direction: column; gap: 14px;
    }
    .rs-card h1 { font-size: clamp(24px, 3vw, 32px); letter-spacing: -0.03em; font-weight: 800; margin-top: 4px; }
    .rs-card__sub { color: var(--rs-text-muted); font-size: 14px; line-height: 1.6; }
    .rs-perks {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
      padding: 14px; background: var(--rs-surface-2); border-radius: var(--rs-radius-md);
    }
    .rs-perks > div { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--rs-text-muted); font-weight: 500; }
    .rs-perks rs-icon { color: var(--rs-brand-600); }
    .rs-form { display: flex; flex-direction: column; gap: 12px; margin-top: 6px; }
    .rs-form__row rs-input { width: 100%; }
    .rs-form__row--2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .rs-card__foot { font-size: 13px; text-align: center; color: var(--rs-text-muted); margin-top: 6px; }
    .rs-card__foot a { color: var(--rs-brand-600); font-weight: 600; }
    @media (max-width: 520px) { .rs-perks, .rs-form__row--2 { grid-template-columns: 1fr; } }
  `],
})
export class RequestSellerComponent {
  submitting = signal(false);
  private toast = inject(ToastService);
  private router = inject(Router);

  submit(e: Event) {
    e.preventDefault();
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.toast.success('Application received', 'We\u2019ll email you within 48 hours.');
      this.router.navigate(['/']);
    }, 1200);
  }
}
