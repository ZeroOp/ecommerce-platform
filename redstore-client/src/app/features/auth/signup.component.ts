import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthCardComponent } from './auth-card.component';

@Component({
  selector: 'rs-signup',
  standalone: true,
  imports: [RouterLink, AuthCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-auth-card
      kind="user"
      eyebrow="Join RedStore"
      title="Create your account"
      subtitle="Get personalized recommendations, early access to drops, and faster checkouts.">
      <span>Already have an account? <a routerLink="/auth/signin">Sign in</a></span>
      <span>Want to sell? <a routerLink="/auth/request-seller">Apply to become a seller</a></span>
    </rs-auth-card>
  `,
})
export class SignupComponent {}
