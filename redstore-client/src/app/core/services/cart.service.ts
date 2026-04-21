import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { CartApiService, CartApiResponse, CheckoutResult } from './cart-api.service';
import { DealApiService } from './deal-api.service';

export interface CartItem {
  product: Product;
  quantity: number;
  availableQuantity?: number;
}

const STORAGE_KEY = 'rs_cart';

/**
 * Dual-mode cart:
 *   • When the user is authenticated with a real (non-demo) account, every
 *     mutation is forwarded to the cart-service backend (Redis Cluster).
 *     cart-service re-signs image URLs from its local catalog projection on
 *     every response, so the client just trusts what comes back.
 *   • In demo mode or when signed out, the cart lives in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private cartApi = inject(CartApiService);
  private auth = inject(AuthService);
  private dealApi = inject(DealApiService);

  private _items = signal<CartItem[]>(this.loadLocal());
  private _syncing = signal(false);

  readonly items = this._items.asReadonly();
  readonly syncing = this._syncing.asReadonly();
  readonly count = computed(() =>
    this._items().reduce((n, it) => n + it.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this._items().reduce((s, it) => s + it.product.price * it.quantity, 0)
  );
  readonly savings = computed(() =>
    this._items().reduce(
      (s, it) =>
        s +
        Math.max(0, (it.product.originalPrice ?? it.product.price) - it.product.price) *
          it.quantity,
      0
    )
  );
  readonly hasStockIssue = computed(() =>
    this._items().some(
      (it) => it.availableQuantity != null && it.quantity > it.availableQuantity
    )
  );

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (this.isRemote(user)) {
        void this.refresh();
      } else {
        void this.repriceLocal();
      }
    });
  }

  async refresh(): Promise<void> {
    if (!this.isRemote(this.auth.user())) {
      return;
    }
    this._syncing.set(true);
    try {
      const cart = await firstValueFrom(
        this.cartApi.getCart().pipe(catchError(() => of<CartApiResponse | null>(null)))
      );
      if (cart) {
        this._items.set(await this.withBestDeals(this.fromApi(cart)));
      }
    } finally {
      this._syncing.set(false);
    }
  }

  async add(product: Product, quantity = 1): Promise<void> {
    if (this.isRemote(this.auth.user())) {
      try {
        await this.mutate(() =>
          this.cartApi.addItem({
            productId: product.id,
            quantity,
            name: product.name,
            brand: product.brand,
            image: product.image,
            price: product.price,
            originalPrice: product.originalPrice,
            slug: product.slug,
          })
        );
      } catch {
        // Errors already trigger a refresh + toast path; don't leak.
      }
      return;
    }
    const existing = this._items().find((i) => i.product.id === product.id);
    if (existing) {
      this._items.update((list) =>
        list.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      );
    } else {
      this._items.update((list) => [...list, { product, quantity }]);
    }
    this._items.set(await this.withBestDeals(this._items()));
    this.persist();
  }

  async update(productId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      return this.remove(productId);
    }
    if (this.isRemote(this.auth.user())) {
      await this.mutate(() => this.cartApi.updateQuantity(productId, quantity));
      return;
    }
    this._items.update((list) =>
      list.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
    this._items.set(await this.withBestDeals(this._items()));
    this.persist();
  }

  async remove(productId: string): Promise<void> {
    if (this.isRemote(this.auth.user())) {
      await this.mutate(() => this.cartApi.removeItem(productId));
      return;
    }
    this._items.update((list) => list.filter((i) => i.product.id !== productId));
    this.persist();
  }

  async clear(): Promise<void> {
    if (this.isRemote(this.auth.user())) {
      await this.mutate(() => this.cartApi.clear());
      return;
    }
    this._items.set([]);
    this.persist();
  }

  /**
   * Validates / places the order against inventory. On remote carts this
   * goes through the backend; locally we only simulate success.
   */
  async checkout(dryRun = false): Promise<CheckoutResult | null> {
    if (!this.isRemote(this.auth.user())) {
      if (!dryRun) {
        this._items.set([]);
        this.persist();
      }
      return null;
    }
    this._syncing.set(true);
    try {
      const result = await firstValueFrom(this.cartApi.checkout(dryRun));
      if (result?.cart) {
        this._items.set(this.fromApi(result.cart));
      }
      return result;
    } finally {
      this._syncing.set(false);
    }
  }

  // ------------ helpers ------------

  /** Remote path only kicks in for real, logged-in users (not demo). */
  private isRemote(user: ReturnType<AuthService['user']>): boolean {
    const id = user?.id != null ? String(user.id) : '';
    return !!user && !id.startsWith('demo-');
  }

  private async mutate(
    call: () => ReturnType<CartApiService['addItem']>
  ): Promise<void> {
    this._syncing.set(true);
    try {
      const cart = await firstValueFrom(call());
      this._items.set(await this.withBestDeals(this.fromApi(cart)));
    } catch (err) {
      // Network / auth failures: re-sync from the server so the UI stays
      // in lock-step with the authoritative cart in Redis.
      await this.refresh().catch(() => {});
      throw err;
    } finally {
      this._syncing.set(false);
    }
  }

  private fromApi(cart: CartApiResponse): CartItem[] {
    return cart.items.map((it) => ({
      quantity: it.quantity,
      availableQuantity: it.availableQuantity,
      product: {
        id: it.productId,
        name: it.name ?? '',
        slug: it.slug ?? '',
        description: '',
        price: Number(it.price ?? 0),
        originalPrice: it.originalPrice,
        rating: 0,
        reviews: 0,
        image: it.image ?? '',
        category: '',
        brand: it.brand ?? '',
        inStock: (it.availableQuantity ?? 1) > 0,
        stockCount: it.availableQuantity,
      },
    }));
  }

  private loadLocal(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private async repriceLocal(): Promise<void> {
    const base = this.loadLocal();
    this._items.set(await this.withBestDeals(base));
  }

  private async withBestDeals(items: CartItem[]): Promise<CartItem[]> {
    const ids = Array.from(new Set(items.map((i) => i.product.id).filter(Boolean)));
    if (!ids.length) return items;
    try {
      const deals = await firstValueFrom(this.dealApi.bestByProducts(ids));
      const byProduct = new Map(deals.map((d) => [d.productId, d]));
      return items.map((it) => {
        const d = byProduct.get(it.product.id);
        if (!d || !(d.discountPercentage > 0)) return it;
        const baseOriginal = Number(it.product.originalPrice ?? it.product.price ?? 0);
        const discounted = Math.max(0, baseOriginal - (baseOriginal * Number(d.discountPercentage)) / 100);
        return {
          ...it,
          product: {
            ...it.product,
            originalPrice: Number(baseOriginal.toFixed(2)),
            price: Number(discounted.toFixed(2)),
            discount: Number(d.discountPercentage),
            badge: it.product.badge ?? 'Deal',
          },
        };
      });
    } catch {
      return items;
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
    } catch {
      // ignore storage quota errors
    }
  }
}
