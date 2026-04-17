import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthCardComponent } from './auth-card.component';

@Component({
  selector: 'rs-seller-signin',
  standalone: true,
  imports: [RouterLink, AuthCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-auth-card
      kind="seller"
      eyebrow="Seller portal"
      title="Sign in to Seller Hub"
      subtitle="Manage your catalog, orders, brands and revenue — all in one place."
      googleBtnId="rs-google-seller">
      <span>Not a seller yet? <a routerLink="/auth/request-seller">Apply to sell</a></span>
      <span>Customer sign in? <a routerLink="/auth/signin">Go to user sign in</a></span>
    </rs-auth-card>
  `,
})
export class SellerSigninComponent {}
