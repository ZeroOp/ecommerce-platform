import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'rs-seller-analytics',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Insights" title="Analytics" subtitle="Understand performance, trends and opportunities."></rs-page-header>

    <div class="stats">
      <rs-stat-card label="Sessions"   value="48,231"  icon="chart"  [delta]="18.3" accent="#6366f1"></rs-stat-card>
      <rs-stat-card label="Add to cart"value="3,412"   icon="cart"   [delta]="7.2"  accent="#10b981"></rs-stat-card>
      <rs-stat-card label="Conversion" value="3.8%"    icon="sparkle" [delta]="1.1" accent="#f59e0b"></rs-stat-card>
      <rs-stat-card label="AOV"        value="$112.30" icon="dollar" [delta]="4.4"  accent="#e11d48"></rs-stat-card>
    </div>

    <div class="grid">
      <section class="card">
        <header><h3>Revenue trend</h3></header>
        <svg viewBox="0 0 500 180" class="svg">
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#e11d48" stop-opacity=".3"/>
              <stop offset="1" stop-color="#e11d48" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polyline points="0,150 50,130 100,120 150,140 200,110 250,90 300,100 350,80 400,60 450,70 500,50" fill="none" stroke="#e11d48" stroke-width="2.5" />
          <polygon points="0,150 50,130 100,120 150,140 200,110 250,90 300,100 350,80 400,60 450,70 500,50 500,180 0,180" fill="url(#ag)"/>
        </svg>
      </section>

      <section class="card">
        <header><h3>Traffic sources</h3></header>
        <ul class="bars">
          <li><span>Organic search</span><div class="bar"><div style="width:68%"></div></div><b>68%</b></li>
          <li><span>Direct</span><div class="bar"><div style="width:42%"></div></div><b>42%</b></li>
          <li><span>Social</span><div class="bar"><div style="width:28%"></div></div><b>28%</b></li>
          <li><span>Email</span><div class="bar"><div style="width:18%"></div></div><b>18%</b></li>
          <li><span>Paid</span><div class="bar"><div style="width:12%"></div></div><b>12%</b></li>
        </ul>
      </section>

      <section class="card">
        <header><h3>Top categories</h3></header>
        <ul class="cats">
          <li><span>Fashion</span><strong>$18.4k</strong></li>
          <li><span>Electronics</span><strong>$14.2k</strong></li>
          <li><span>Beauty</span><strong>$9.6k</strong></li>
          <li><span>Furniture</span><strong>$6.4k</strong></li>
          <li><span>Sports</span><strong>$4.1k</strong></li>
        </ul>
      </section>

      <section class="card">
        <header><h3>New customers</h3></header>
        <div class="donut">
          <svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#e4e4e7" stroke-width="3" fill="none"/>
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#e11d48" stroke-width="3" fill="none" stroke-dasharray="68 100"/></svg>
          <div>
            <strong>68%</strong>
            <span>returning</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: auto auto; gap: 16px; }
    .card { background: white; border: 1px solid var(--rs-border); border-radius: var(--rs-radius-lg); padding: 20px 22px; }
    .card header { margin-bottom: 14px; }
    .card h3 { font-size: 14px; font-weight: 700; }
    .svg { width: 100%; height: 220px; }
    .bars { display: flex; flex-direction: column; gap: 12px; }
    .bars li { display: grid; grid-template-columns: 110px 1fr 40px; align-items: center; gap: 10px; font-size: 13px; }
    .bar { height: 10px; background: var(--rs-surface-2); border-radius: 999px; overflow: hidden; }
    .bar > div { height: 100%; background: var(--rs-gradient-brand); border-radius: 999px; }
    .cats { display: flex; flex-direction: column; }
    .cats li { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--rs-border); font-size: 13px; }
    .cats li:last-child { border-bottom: 0; }
    .cats strong { font-weight: 700; }
    .donut { position: relative; width: 180px; height: 180px; margin: 0 auto; }
    .donut svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .donut > div { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .donut strong { font-size: 28px; font-family: var(--rs-font-display); font-weight: 800; }
    .donut span { font-size: 11px; color: var(--rs-text-subtle); text-transform: uppercase; letter-spacing: 0.1em; }

    @media (max-width: 1024px) { .stats, .grid { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class SellerAnalyticsComponent {}
