import { AfterViewInit, ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, LoginKind } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'rs-auth-card',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="auth-card rs-anim-fade">
      <rs-badge *ngIf="eyebrow" tone="brand" [soft]="true">{{ eyebrow }}</rs-badge>
      <h1>{{ title }}</h1>
      <p class="auth-card__sub" *ngIf="subtitle">{{ subtitle }}</p>

      <div class="auth-card__google" [id]="googleBtnId"></div>

      <div class="auth-card__divider"><span>or continue as</span></div>

      <rs-button variant="dark" size="lg" [block]="true" (click)="demoLogin()">
        <rs-icon slot="icon" name="zap" [size]="16"></rs-icon>
        Try a demo {{ kind }} account
      </rs-button>

      <div class="auth-card__links">
        <ng-content></ng-content>
      </div>

      <footer class="auth-card__foot">
        <span>By continuing, you agree to our <a>Terms</a> and <a>Privacy Policy</a>.</span>
      </footer>
    </article>
  `,
  styles: [`
    .auth-card {
      width: 100%;
      max-width: 460px;
      background: var(--rs-surface);
      border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-xl);
      padding: 40px;
      box-shadow: var(--rs-shadow-lg);
      display: flex; flex-direction: column; gap: 14px;
    }
    .auth-card h1 { font-size: clamp(26px, 3vw, 34px); letter-spacing: -0.03em; font-weight: 800; margin-top: 4px; }
    .auth-card__sub { color: var(--rs-text-muted); margin-bottom: 4px; line-height: 1.55; font-size: 14px; }
    .auth-card__google { display: flex; justify-content: center; margin: 4px 0; min-height: 40px; }
    .auth-card__divider {
      position: relative;
      text-align: center;
      font-size: 12px;
      color: var(--rs-text-subtle);
      margin: 6px 0;
    }
    .auth-card__divider::before, .auth-card__divider::after {
      content: ''; position: absolute; top: 50%; width: 40%; height: 1px; background: var(--rs-border);
    }
    .auth-card__divider::before { left: 0; }
    .auth-card__divider::after  { right: 0; }
    .auth-card__divider span { padding: 0 8px; background: var(--rs-surface); position: relative; z-index: 1; }
    .auth-card__links {
      display: flex; flex-direction: column; gap: 8px;
      margin-top: 6px;
      padding-top: 18px;
      border-top: 1px dashed var(--rs-border);
      font-size: 13px;
      color: var(--rs-text-muted);
    }
    .auth-card__links a { color: var(--rs-brand-600); font-weight: 600; }
    .auth-card__foot { font-size: 11px; color: var(--rs-text-subtle); text-align: center; margin-top: 8px; }
    .auth-card__foot a { color: var(--rs-text); text-decoration: underline; cursor: pointer; }
  `],
})
export class AuthCardComponent implements AfterViewInit {
  @Input({ required: true }) kind!: LoginKind;
  @Input() eyebrow?: string;
  @Input() title = 'Welcome back';
  @Input() subtitle?: string;
  @Input() googleBtnId = 'rs-google-btn';

  private auth = inject(AuthService);
  private google = inject(GoogleAuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  ngAfterViewInit() {
    this.google.renderButton(this.googleBtnId, this.auth.googleClientId, (token) => {
      this.handleGoogle(token);
    });
  }

  handleGoogle(idToken: string) {
    this.auth.loginWithGoogle(idToken, this.kind).subscribe({
      next: () => {
        this.toast.success('Signed in', 'Welcome to RedStore!');
        this.auth.redirectAfterLogin();
      },
      error: () => {
        this.toast.error('Sign in failed', 'We could not sign you in. Please try again.');
      },
    });
  }

  demoLogin() {
    this.auth.loginAsDemo(this.kind);
    this.toast.success('Signed in (demo)', `Browsing as ${this.kind}`);
    this.auth.redirectAfterLogin();
  }
}
