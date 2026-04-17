import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = 'rs_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly count = computed(() =>
    this._items().reduce((n, it) => n + it.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this._items().reduce((s, it) => s + it.product.price * it.quantity, 0)
  );
  readonly savings = computed(() =>
    this._items().reduce(
      (s, it) => s + Math.max(0, (it.product.originalPrice ?? it.product.price) - it.product.price) * it.quantity,
      0
    )
  );

  add(product: Product, quantity = 1): void {
    const existing = this._items().find(i => i.product.id === product.id);
    if (existing) {
      this._items.update(list => list.map(i => i.product.id === product.id
        ? { ...i, quantity: i.quantity + quantity }
        : i));
    } else {
      this._items.update(list => [...list, { product, quantity }]);
    }
    this.persist();
  }

  update(productId: string, quantity: number): void {
    if (quantity <= 0) return this.remove(productId);
    this._items.update(list =>
      list.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
    this.persist();
  }

  remove(productId: string): void {
    this._items.update(list => list.filter(i => i.product.id !== productId));
    this.persist();
  }

  clear(): void {
    this._items.set([]);
    this.persist();
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
    } catch {}
  }
}
