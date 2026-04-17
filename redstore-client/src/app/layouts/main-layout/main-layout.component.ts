import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'rs-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-header></rs-header>
    <main class="rs-main"><router-outlet></router-outlet></main>
    <rs-footer></rs-footer>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .rs-main { min-height: calc(100vh - var(--rs-nav-h) - 200px); }
  `],
})
export class MainLayoutComponent {}
