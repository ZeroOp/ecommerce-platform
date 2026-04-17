import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'rs-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rs-auth">
      <aside class="rs-auth__side">
        <a class="rs-auth__brand" routerLink="/">
          <span class="rs-auth__logo">R</span>
          <span>red<span class="rs-gradient-text">store</span></span>
        </a>
        <div class="rs-auth__side-copy">
          <span class="rs-auth__eyebrow">Welcome to RedStore</span>
          <h2>Shop the world’s most iconic brands — all in one place.</h2>
          <p>Millions of products · Trusted sellers · Lightning-fast delivery.</p>
        </div>
        <div class="rs-auth__badges">
          <div class="rs-auth__badge"><strong>2M+</strong> products</div>
          <div class="rs-auth__badge"><strong>120k</strong> sellers</div>
          <div class="rs-auth__badge"><strong>4.9★</strong> rating</div>
        </div>
      </aside>
      <section class="rs-auth__main">
        <router-outlet></router-outlet>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .rs-auth {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      min-height: 100vh;
    }
    .rs-auth__side {
      position: relative;
      padding: 48px;
      color: white;
      background: #0a0a0a;
      background-image: var(--rs-gradient-mesh), linear-gradient(135deg, #1a0a14 0%, #0a0a0a 60%);
      display: flex; flex-direction: column; justify-content: space-between;
      overflow: hidden;
    }
    .rs-auth__side::before {
      content: '';
      position: absolute; right: -80px; top: -80px;
      width: 320px; height: 320px; border-radius: 50%;
      background: radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%);
    }
    .rs-auth__side::after {
      content: '';
      position: absolute; left: -100px; bottom: -100px;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%);
    }
    .rs-auth__brand {
      display: inline-flex; align-items: center; gap: 10px;
      font-family: var(--rs-font-display); font-weight: 800; font-size: 22px; color: white;
      z-index: 2;
    }
    .rs-auth__logo {
      width: 40px; height: 40px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--rs-gradient-brand); box-shadow: var(--rs-shadow-brand);
    }
    .rs-auth__side-copy { z-index: 2; max-width: 480px; }
    .rs-auth__eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--rs-brand-400); }
    .rs-auth__side h2 {
      font-size: clamp(28px, 3.5vw, 40px);
      line-height: 1.15;
      color: white;
      margin-top: 14px;
    }
    .rs-auth__side p { color: #a1a1aa; margin-top: 14px; font-size: 16px; max-width: 420px; line-height: 1.6; }
    .rs-auth__badges {
      position: relative; z-index: 2;
      display: flex; gap: 10px;
      flex-wrap: wrap;
    }
    .rs-auth__badge {
      padding: 10px 16px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: var(--rs-radius-pill);
      font-size: 13px; color: #e4e4e7;
      backdrop-filter: blur(6px);
    }
    .rs-auth__badge strong { color: white; margin-right: 4px; font-weight: 700; }
    .rs-auth__main {
      padding: 48px;
      display: flex; align-items: center; justify-content: center;
      background: var(--rs-bg);
    }
    @media (max-width: 900px) {
      .rs-auth { grid-template-columns: 1fr; }
      .rs-auth__side { padding: 32px; }
      .rs-auth__side-copy h2 { font-size: 24px; }
      .rs-auth__main { padding: 24px; }
    }
  `],
})
export class AuthLayoutComponent {}
