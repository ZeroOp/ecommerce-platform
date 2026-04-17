import { Order } from '../core/models/order.model';
import { PRODUCTS } from './mock-products';

const rand = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const customers = [
  { name: 'Ava Patel',     email: 'ava.patel@example.com' },
  { name: 'Noah Johnson',  email: 'noah.j@example.com' },
  { name: 'Mia Chen',      email: 'mia.chen@example.com' },
  { name: 'Liam Rodriguez',email: 'liam.r@example.com' },
  { name: 'Emma Williams', email: 'emma.w@example.com' },
  { name: 'Oliver Singh',  email: 'oliver.s@example.com' },
  { name: 'Sophia Gomez',  email: 'sophia.g@example.com' },
  { name: 'Ethan Brown',   email: 'ethan.b@example.com' },
];

const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled', 'returned'];
const paymentMethods = ['Visa •• 4242', 'Mastercard •• 1987', 'UPI @redstore', 'PayPal', 'Apple Pay'];
const addresses = [
  '12 Harborview Ave, Brooklyn, NY',
  '889 Cypress Ln, Austin, TX',
  'Unit 5C, 4 Sheffield Rd, London',
  '2 Marine Dr, Mumbai, India',
  '908 Bay Rd, San Francisco, CA',
  '44 Lindenstraße, Berlin, DE',
];

export const ORDERS: Order[] = Array.from({ length: 28 }).map((_, i) => {
  const cust = rand(customers);
  const count = 1 + Math.floor(Math.random() * 3);
  const items = Array.from({ length: count }).map(() => {
    const p = rand(PRODUCTS);
    const qty = 1 + Math.floor(Math.random() * 2);
    return {
      productId: p.id,
      name: p.name,
      image: p.image,
      price: p.price,
      quantity: qty,
    };
  });
  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
  return {
    id: `RS-${10234 + i}`,
    customer: cust.name,
    customerEmail: cust.email,
    items,
    total: Math.round(total * 100) / 100,
    status: rand(statuses),
    placedAt: isoDaysAgo(Math.floor(Math.random() * 40)),
    shippingAddress: rand(addresses),
    paymentMethod: rand(paymentMethods),
  };
});
