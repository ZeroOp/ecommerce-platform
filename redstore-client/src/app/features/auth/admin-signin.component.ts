import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthCardComponent } from './auth-card.component';

@Component({
  selector: 'rs-admin-signin',
  standalone: true,
  imports: [RouterLink, AuthCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-auth-card
      kind="admin"
      eyebrow="Restricted"
      title="Admin console sign in"
      subtitle="Only authorized RedStore administrators can access this area."
      googleBtnId="rs-google-admin">
      <span>Need customer sign in? <a routerLink="/auth/signin">User sign in</a></span>
      <span>Looking for seller login? <a routerLink="/auth/seller-signin">Seller sign in</a></span>
    </rs-auth-card>
  `,
})
export class AdminSigninComponent {}
