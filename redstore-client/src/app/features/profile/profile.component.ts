import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'rs-profile',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, InputComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rs-container profile">
      <rs-page-header eyebrow="Account" title="Your profile" subtitle="Manage your personal details and preferences."></rs-page-header>

      <div class="profile__grid">
        <aside class="profile__card profile__id">
          <div class="profile__avatar">
            <img *ngIf="auth.user()?.avatar" [src]="auth.user()!.avatar" [alt]="auth.user()!.email" />
            <span *ngIf="!auth.user()?.avatar">{{ auth.user()?.email?.charAt(0)?.toUpperCase() }}</span>
          </div>
          <h2>{{ auth.user()?.name || 'Guest user' }}</h2>
          <div class="profile__email">{{ auth.user()?.email || 'Not signed in' }}</div>
          <div class="profile__chip">{{ (auth.user()?.role || 'guest') | titlecase }}</div>
          <rs-button variant="outline" (click)="auth.logout()">
            <rs-icon slot="icon" name="logout" [size]="16"></rs-icon>
            Sign out
          </rs-button>
        </aside>

        <div class="profile__main">
          <section class="profile__card">
            <header><h3>Personal information</h3><p>These details are only visible to you.</p></header>
            <div class="profile__row profile__row--2">
              <rs-input label="First name" placeholder="Jane"></rs-input>
              <rs-input label="Last name" placeholder="Doe"></rs-input>
            </div>
            <div class="profile__row profile__row--2">
              <rs-input label="Email" [placeholder]="auth.user()?.email || 'you@email.com'" type="email"></rs-input>
              <rs-input label="Phone" placeholder="+1 (555) 010-2354"></rs-input>
            </div>
            <div class="profile__actions">
              <rs-button variant="primary">Save changes</rs-button>
              <rs-button variant="ghost">Cancel</rs-button>
            </div>
          </section>

          <section class="profile__card">
            <header><h3>Saved addresses</h3><p>Add shipping destinations for a faster checkout.</p></header>
            <div class="profile__addresses">
              <div class="addr">
                <div>
                  <div class="addr__label">Home <span>Default</span></div>
                  <div>12 Harborview Ave</div>
                  <div>Brooklyn, NY 11211</div>
                  <div>United States</div>
                </div>
                <button class="addr__edit"><rs-icon name="edit" [size]="14"></rs-icon></button>
              </div>
              <button class="addr addr--new">
                <rs-icon name="plus" [size]="20"></rs-icon>
                <span>Add new address</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .profile { padding: 40px 24px; }
    .profile__grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }

    .profile__card {
      background: white; border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-lg); padding: 24px;
      box-shadow: var(--rs-shadow-xs);
    }
    .profile__card header { margin-bottom: 18px; }
    .profile__card header h3 { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; }
    .profile__card header p { font-size: 13px; color: var(--rs-text-muted); margin-top: 4px; }

    .profile__id { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .profile__avatar {
      width: 96px; height: 96px; border-radius: 50%;
      background: var(--rs-gradient-brand);
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 40px; font-weight: 700; color: white;
      overflow: hidden;
      box-shadow: var(--rs-shadow-brand);
      margin-bottom: 8px;
    }
    .profile__avatar img { width: 100%; height: 100%; object-fit: cover; }
    .profile__id h2 { font-size: 22px; }
    .profile__email { color: var(--rs-text-muted); font-size: 13px; }
    .profile__chip {
      padding: 4px 12px;
      background: var(--rs-brand-50);
      color: var(--rs-brand-700);
      font-size: 12px; font-weight: 600;
      border-radius: 999px;
      margin-bottom: 8px;
    }

    .profile__main { display: flex; flex-direction: column; gap: 16px; }
    .profile__row { display: flex; gap: 12px; margin-bottom: 12px; }
    .profile__row--2 { display: grid; grid-template-columns: 1fr 1fr; }
    .profile__actions { display: flex; gap: 8px; margin-top: 10px; }

    .profile__addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .addr {
      position: relative;
      padding: 16px 18px;
      background: var(--rs-surface-2);
      border-radius: var(--rs-radius-md);
      font-size: 13px; color: var(--rs-text-muted);
      line-height: 1.6;
    }
    .addr__label { font-weight: 700; color: var(--rs-text); margin-bottom: 4px; }
    .addr__label span { margin-left: 6px; font-size: 10px; font-weight: 700; color: var(--rs-brand-600); background: var(--rs-brand-50); padding: 2px 6px; border-radius: 999px; }
    .addr__edit {
      position: absolute; top: 12px; right: 12px;
      width: 28px; height: 28px; border-radius: 8px; color: var(--rs-text-subtle);
    }
    .addr__edit:hover { background: white; color: var(--rs-text); }
    .addr--new {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
      color: var(--rs-text-muted); font-weight: 600;
      border: 2px dashed var(--rs-border-strong);
      background: transparent;
      min-height: 130px;
      transition: border-color var(--rs-dur-fast) var(--rs-ease), color var(--rs-dur-fast) var(--rs-ease);
    }
    .addr--new:hover { border-color: var(--rs-brand-500); color: var(--rs-brand-600); }

    @media (max-width: 900px) {
      .profile__grid { grid-template-columns: 1fr; }
      .profile__row--2, .profile__addresses { grid-template-columns: 1fr; }
    }
  `],
})
export class ProfileComponent {
  auth = inject(AuthService);
}
