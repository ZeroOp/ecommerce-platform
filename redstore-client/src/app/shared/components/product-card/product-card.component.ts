import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { IconComponent } from '../icon/icon.component';
import { BadgeComponent } from '../badge/badge.component';
import { RatingComponent } from '../rating/rating.component';

@Component({
  selector: 'rs-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, BadgeComponent, RatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="rs-pc">
      <a class="rs-pc__media" [routerLink]="['/product', product.id]">
        <img [src]="product.image" [alt]="product.name" loading="lazy" />
        <div class="rs-pc__chips">
          <rs-badge *ngIf="product.badge" tone="dark">{{ product.badge }}</rs-badge>
          <rs-badge *ngIf="product.discount" tone="brand">-{{ product.discount }}%</rs-badge>
          <rs-badge *ngIf="!product.inStock" tone="danger">Out of stock</rs-badge>
        </div>
        <button
          type="button"
          class="rs-pc__wish"
          [class.is-on]="wished"
          (click)="toggleWish($event)"
          aria-label="Save to wishlist">
          <rs-icon name="heart" [size]="18"></rs-icon>
        </button>
      </a>

      <div class="rs-pc__body">
        <div class="rs-pc__brand">{{ product.brand }}</div>
        <a class="rs-pc__name" [routerLink]="['/product', product.id]">{{ product.name }}</a>
        <rs-rating size="sm" [value]="product.rating" [reviews]="product.reviews"></rs-rating>

        <div class="rs-pc__price-row">
          <div class="rs-pc__price">
            <span class="rs-pc__now">\${{ product.price | number: '1.2-2' }}</span>
            <span *ngIf="product.originalPrice" class="rs-pc__was">\${{ product.originalPrice | number: '1.2-2' }}</span>
          </div>
          <button type="button" class="rs-pc__add" (click)="add.emit(product)" [disabled]="!product.inStock">
            <rs-icon name="plus" [size]="18"></rs-icon>
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; }
    .rs-pc {
      position: relative;
      display: flex;
      flex-direction: column;
      background: var(--rs-surface);
      border-radius: var(--rs-radius-lg);
      overflow: hidden;
      box-shadow: var(--rs-shadow-sm);
      border: 1px solid var(--rs-border);
      transition: transform var(--rs-dur) var(--rs-ease), box-shadow var(--rs-dur) var(--rs-ease);
    }
    .rs-pc:hover {
      transform: translateY(-4px);
      box-shadow: var(--rs-shadow-lg);
    }
    .rs-pc__media {
      position: relative;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      background: var(--rs-surface-2);
      display: block;
    }
    .rs-pc__media img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform var(--rs-dur-slow) var(--rs-ease);
    }
    .rs-pc:hover .rs-pc__media img { transform: scale(1.06); }
    .rs-pc__chips {
      position: absolute; top: 12px; left: 12px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .rs-pc__wish {
      position: absolute; top: 10px; right: 10px;
      width: 36px; height: 36px;
      display: inline-flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,.92);
      backdrop-filter: blur(6px);
      border-radius: 50%;
      color: var(--rs-text-muted);
      transition: transform var(--rs-dur-fast) var(--rs-ease), color var(--rs-dur-fast) var(--rs-ease);
      box-shadow: var(--rs-shadow-sm);
    }
    .rs-pc__wish:hover { transform: scale(1.08); color: var(--rs-brand-600); }
    .rs-pc__wish.is-on { color: var(--rs-brand-600); }
    .rs-pc__body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 6px; }
    .rs-pc__brand { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--rs-text-subtle); }
    .rs-pc__name { font-size: 14px; font-weight: 600; color: var(--rs-text); line-height: 1.35; }
    .rs-pc__name:hover { color: var(--rs-brand-600); }
    .rs-pc__price-row {
      margin-top: 6px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .rs-pc__price { display: flex; align-items: baseline; gap: 8px; }
    .rs-pc__now { font-size: 17px; font-weight: 700; color: var(--rs-text); }
    .rs-pc__was { font-size: 13px; color: var(--rs-text-subtle); text-decoration: line-through; }
    .rs-pc__add {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: var(--rs-gradient-brand);
      color: white;
      display: inline-flex; align-items: center; justify-content: center;
      box-shadow: var(--rs-shadow-brand);
      transition: transform var(--rs-dur-fast) var(--rs-ease);
    }
    .rs-pc__add:hover:not(:disabled) { transform: scale(1.08) rotate(4deg); }
    .rs-pc__add:disabled { background: var(--rs-surface-3); color: var(--rs-text-subtle); box-shadow: none; cursor: not-allowed; }
  `],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() wished = false;
  @Output() add = new EventEmitter<Product>();
  @Output() wish = new EventEmitter<Product>();

  toggleWish(e: Event) {
    e.preventDefault(); e.stopPropagation();
    this.wished = !this.wished;
    this.wish.emit(this.product);
  }
}
