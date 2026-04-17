import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'rs-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="nf">
      <div class="nf__num">4<span>0</span>4</div>
      <h1>Page not found</h1>
      <p>We couldn't find what you were looking for. Let's get you back on track.</p>
      <a class="nf__btn" routerLink="/">Go home</a>
    </section>
  `,
  styles: [`
    .nf { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; }
    .nf__num {
      font-family: var(--rs-font-display);
      font-size: clamp(90px, 18vw, 200px);
      font-weight: 900;
      line-height: 1;
      background: var(--rs-gradient-brand);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.05em;
      margin-bottom: 16px;
    }
    .nf__num span { animation: spin 4s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .nf h1 { font-size: 32px; letter-spacing: -0.03em; font-weight: 800; }
    .nf p { color: var(--rs-text-muted); margin-top: 8px; max-width: 420px; }
    .nf__btn {
      margin-top: 24px;
      padding: 14px 28px; background: #0a0a0a; color: white;
      border-radius: 999px; font-weight: 600;
    }
  `],
})
export class NotFoundComponent {}
