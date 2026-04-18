import { Observable, catchError, map, of } from 'rxjs';
import { Product } from '../models/product.model';
import { InventoryApiService } from './inventory-api.service';

/**
 * Decorates a list of products with their live `stockCount` and `inStock`
 * flag using the inventory public batch endpoint. Safe to call with an
 * empty array — it short-circuits without hitting the network.
 */
export function enrichWithInventory(
  products: Product[],
  inventoryApi: InventoryApiService,
): Observable<Product[]> {
  if (!products || products.length === 0) {
    return of(products ?? []);
  }
  const ids = products.map((p) => p.id);
  return inventoryApi.getBatchQuantities(ids).pipe(
    map((map) => applyQuantities(products, map)),
    catchError(() => of(products)),
  );
}

export function applyQuantities(
  products: Product[],
  quantities: Record<string, number>,
): Product[] {
  return products.map((p) => {
    const qty = quantities[p.id];
    if (qty == null) {
      return p;
    }
    return {
      ...p,
      stockCount: qty,
      inStock: qty > 0,
    };
  });
}
