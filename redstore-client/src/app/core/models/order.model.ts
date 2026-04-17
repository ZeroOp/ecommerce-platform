export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  placedAt: string;
  shippingAddress: string;
  paymentMethod: string;
}
