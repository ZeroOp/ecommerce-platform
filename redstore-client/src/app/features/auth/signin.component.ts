import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthCardComponent } from './auth-card.component';

@Component({
  selector: 'rs-signin',
  standalone: true,
  imports: [RouterLink, AuthCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-auth-card
      kind="user"
      eyebrow="Sign in"
      title="Welcome back to RedStore"
      subtitle="Sign in with Google to continue shopping and track your orders.">
      <span>New to RedStore? <a routerLink="/auth/signup">Create an account</a></span>
      <span>Selling with us? <a routerLink="/auth/seller-signin">Seller sign in</a></span>
      <span>Platform admin? <a routerLink="/auth/admin-signin">Admin console</a></span>
    </rs-auth-card>
  `,
})
export class SigninComponent {}
