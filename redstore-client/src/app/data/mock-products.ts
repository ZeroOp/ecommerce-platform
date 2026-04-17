import { Product } from '../core/models/product.model';

const img = (seed: string, w = 600) =>
  `https://images.unsplash.com/${seed}?w=${w}&auto=format&fit=crop`;

const mk = (partial: Omit<Product, 'slug' | 'description' | 'reviews'> & Partial<Product>): Product => ({
  slug: partial.id,
  description:
    partial.description ??
    'Crafted with care, exceptional quality and attention to detail. A must-have for your collection.',
  reviews: partial.reviews ?? Math.floor(Math.random() * 600) + 40,
  ...partial,
});

export const PRODUCTS: Product[] = [
  // Fashion
  mk({ id: 'fa-1', name: 'Premium Oversized Tee', price: 29.99, originalPrice: 49.99, discount: 40, rating: 4.7, image: img('photo-1521572163474-6864f9cf17ab'), category: 'fashion', subCategory: 'mens', brand: 'Urban Style', inStock: true, badge: 'Best Seller' }),
  mk({ id: 'fa-2', name: 'Slim Fit Denim Jeans', price: 79.99, rating: 4.4, image: img('photo-1541099649105-f69ad21f3246'), category: 'fashion', subCategory: 'mens', brand: 'Denim Co', inStock: true }),
  mk({ id: 'fa-3', name: 'Statement Leather Jacket', price: 199.99, originalPrice: 299.99, discount: 33, rating: 4.8, image: img('photo-1551028719-001673ce3d33'), category: 'fashion', subCategory: 'mens', brand: 'Rebel', inStock: true, badge: 'Hot' }),
  mk({ id: 'fa-4', name: 'Summer Floral Dress', price: 59.99, rating: 4.6, image: img('photo-1495121605193-b116b5b09a56'), category: 'fashion', subCategory: 'womens', brand: 'Bloom', inStock: true }),
  mk({ id: 'fa-5', name: 'Chunky Sneakers', price: 119.00, originalPrice: 150.00, discount: 20, rating: 4.5, image: img('photo-1542291026-7eec264c27ff'), category: 'fashion', subCategory: 'shoes', brand: 'Stride', inStock: true }),
  mk({ id: 'fa-6', name: 'Designer Sunglasses', price: 89.00, rating: 4.3, image: img('photo-1511499767150-a48a237f0083'), category: 'fashion', subCategory: 'accessories', brand: 'LuxeEyes', inStock: true }),

  // Mobiles
  mk({ id: 'mb-1', name: 'Pro X 12 Pro Max', price: 1199.00, originalPrice: 1299.00, discount: 8, rating: 4.8, image: img('photo-1511707171634-5f897ff02aa9'), category: 'mobiles', subCategory: 'smartphones', brand: 'Nova', inStock: true, badge: 'New' }),
  mk({ id: 'mb-2', name: 'Galaxy Edge Ultra', price: 1099.00, rating: 4.7, image: img('photo-1592899677977-9c10ca588bbd'), category: 'mobiles', subCategory: 'smartphones', brand: 'Orbit', inStock: true }),
  mk({ id: 'mb-3', name: 'Tab Lite 11"', price: 349.00, originalPrice: 449.00, discount: 22, rating: 4.5, image: img('photo-1544244015-0df4b3ffc6b0'), category: 'mobiles', subCategory: 'tablets', brand: 'Nova', inStock: true }),
  mk({ id: 'mb-4', name: '65W Fast Charger', price: 39.00, rating: 4.4, image: img('photo-1583863788434-e58a73438acd'), category: 'mobiles', subCategory: 'chargers', brand: 'Volt', inStock: true }),
  mk({ id: 'mb-5', name: 'Clear Bumper Case', price: 19.00, rating: 4.2, image: img('photo-1601784551446-20c9e07cdbdb'), category: 'mobiles', subCategory: 'cases', brand: 'Shield', inStock: true }),
  mk({ id: 'mb-6', name: 'Wireless Earbuds Pro', price: 149.00, originalPrice: 199.00, discount: 25, rating: 4.6, image: img('photo-1590658268037-6bf12165a8df'), category: 'mobiles', subCategory: 'chargers', brand: 'Sonic', inStock: true, badge: 'Deal' }),

  // Electronics
  mk({ id: 'el-1', name: 'UltraBook 14 M3', price: 1599.00, originalPrice: 1799.00, discount: 11, rating: 4.8, image: img('photo-1496181133206-80ce9b88a853'), category: 'electronics', subCategory: 'laptops', brand: 'Apex', inStock: true, badge: 'Editor\u2019s Pick' }),
  mk({ id: 'el-2', name: 'Studio Over-Ear Headphones', price: 249.00, rating: 4.7, image: img('photo-1505740420928-5e560c06d30e'), category: 'electronics', subCategory: 'headphones', brand: 'Sonic', inStock: true }),
  mk({ id: 'el-3', name: 'Mirrorless Camera 4K', price: 899.00, originalPrice: 1099.00, discount: 18, rating: 4.6, image: img('photo-1502920917128-1aa500764cbd'), category: 'electronics', subCategory: 'cameras', brand: 'Lenz', inStock: true }),
  mk({ id: 'el-4', name: 'Fit Watch Series 9', price: 329.00, rating: 4.5, image: img('photo-1523275335684-37898b6baf30'), category: 'electronics', subCategory: 'wearables', brand: 'Pulse', inStock: true }),
  mk({ id: 'el-5', name: 'Portable Bluetooth Speaker', price: 79.00, rating: 4.3, image: img('photo-1545454675-3531b543be5d'), category: 'electronics', subCategory: 'headphones', brand: 'Sonic', inStock: true }),
  mk({ id: 'el-6', name: '4K Smart Monitor 27"', price: 449.00, originalPrice: 549.00, discount: 18, rating: 4.5, image: img('photo-1527443224154-c4a3942d3acf'), category: 'electronics', subCategory: 'laptops', brand: 'Apex', inStock: false }),

  // Appliances
  mk({ id: 'ap-1', name: 'Stand Mixer 5L', price: 299.00, originalPrice: 399.00, discount: 25, rating: 4.7, image: img('photo-1556909114-f6e7ad7d3136'), category: 'appliances', subCategory: 'kitchen', brand: 'ChefPro', inStock: true }),
  mk({ id: 'ap-2', name: 'Front Load Washer', price: 899.00, rating: 4.4, image: img('photo-1604335398980-ededfcfcaec0'), category: 'appliances', subCategory: 'laundry', brand: 'Pureline', inStock: true }),
  mk({ id: 'ap-3', name: 'Cordless Stick Vacuum', price: 399.00, originalPrice: 499.00, discount: 20, rating: 4.6, image: img('photo-1580913428023-02c695666d61'), category: 'appliances', subCategory: 'cleaning', brand: 'Breezy', inStock: true, badge: 'Top Rated' }),
  mk({ id: 'ap-4', name: 'Espresso Machine', price: 249.00, rating: 4.5, image: img('photo-1585659722983-3a675dabf23d'), category: 'appliances', subCategory: 'small', brand: 'Brewhaus', inStock: true }),

  // Sports
  mk({ id: 'sp-1', name: 'Adjustable Dumbbell Set', price: 349.00, rating: 4.8, image: img('photo-1534438327276-14e5300c3a48'), category: 'sports', subCategory: 'fitness', brand: 'IronWorks', inStock: true, badge: 'Best Seller' }),
  mk({ id: 'sp-2', name: 'Trail Running Shoes', price: 129.00, originalPrice: 169.00, discount: 24, rating: 4.6, image: img('photo-1608231387042-66d1773070a5'), category: 'sports', subCategory: 'outdoor', brand: 'Stride', inStock: true }),
  mk({ id: 'sp-3', name: 'Carbon Road Bike', price: 2199.00, rating: 4.7, image: img('photo-1485965120184-e220f721d03e'), category: 'sports', subCategory: 'cycling', brand: 'Velocity', inStock: true }),
  mk({ id: 'sp-4', name: 'Official Match Football', price: 39.00, rating: 4.4, image: img('photo-1552674605-db6ffd4facb5'), category: 'sports', subCategory: 'team', brand: 'GoalPro', inStock: true }),

  // Books
  mk({ id: 'bk-1', name: 'The Silent Echo', price: 14.99, rating: 4.7, image: img('photo-1512820790803-83ca734da794'), category: 'books', subCategory: 'fiction', brand: 'Penguin', inStock: true }),
  mk({ id: 'bk-2', name: 'Atomic Habits', price: 16.99, originalPrice: 21.99, discount: 23, rating: 4.9, image: img('photo-1544947950-fa07a98d237f'), category: 'books', subCategory: 'nonfiction', brand: 'Avery', inStock: true, badge: 'Bestseller' }),
  mk({ id: 'bk-3', name: 'Modern Algorithms', price: 54.00, rating: 4.6, image: img('photo-1513475382585-d06e58bcb0e0'), category: 'books', subCategory: 'academic', brand: 'Academia', inStock: true }),
  mk({ id: 'bk-4', name: 'The Dragon Adventure', price: 11.99, rating: 4.8, image: img('photo-1618401471353-b98afee0b2eb'), category: 'books', subCategory: 'children', brand: 'Scholastic', inStock: true }),

  // Furniture
  mk({ id: 'fu-1', name: 'Velvet Sectional Sofa', price: 1299.00, originalPrice: 1599.00, discount: 19, rating: 4.6, image: img('photo-1586023492125-27b2c045efd7'), category: 'furniture', subCategory: 'living', brand: 'HomeHaus', inStock: true }),
  mk({ id: 'fu-2', name: 'Oak Queen Bed Frame', price: 699.00, rating: 4.5, image: img('photo-1505693416388-ac5ce068fe85'), category: 'furniture', subCategory: 'bedroom', brand: 'NordicLiving', inStock: true }),
  mk({ id: 'fu-3', name: 'Ergonomic Office Chair', price: 349.00, originalPrice: 449.00, discount: 22, rating: 4.7, image: img('photo-1518455027359-f3f8164ba6bd'), category: 'furniture', subCategory: 'office', brand: 'Postura', inStock: true, badge: 'Staff Pick' }),
  mk({ id: 'fu-4', name: 'Outdoor Lounger Set', price: 899.00, rating: 4.4, image: img('photo-1519974719765-e6559eac2575'), category: 'furniture', subCategory: 'outdoor', brand: 'Sunnyside', inStock: true }),

  // Beauty
  mk({ id: 'be-1', name: 'Matte Lipstick Trio', price: 36.00, rating: 4.6, image: img('photo-1596462502278-27bfdc403348'), category: 'beauty', subCategory: 'makeup', brand: 'Luxe', inStock: true }),
  mk({ id: 'be-2', name: 'Vitamin C Serum', price: 29.00, originalPrice: 39.00, discount: 26, rating: 4.8, image: img('photo-1556228453-efd6c1ff04f6'), category: 'beauty', subCategory: 'skincare', brand: 'Glow', inStock: true, badge: 'Trending' }),
  mk({ id: 'be-3', name: 'Amber Oud Perfume', price: 89.00, rating: 4.7, image: img('photo-1541643600914-78b084683601'), category: 'beauty', subCategory: 'fragrance', brand: 'Maison', inStock: true }),
  mk({ id: 'be-4', name: 'Keratin Repair Shampoo', price: 22.00, rating: 4.5, image: img('photo-1522336572468-97b06e8ef143'), category: 'beauty', subCategory: 'haircare', brand: 'Silkstrand', inStock: true }),

  // Toys
  mk({ id: 'to-1', name: 'Dino Explorer Set', price: 29.00, rating: 4.7, image: img('photo-1558060370-d644479cb6f7'), category: 'toys', subCategory: 'action', brand: 'PlayPlanet', inStock: true }),
  mk({ id: 'to-2', name: '1000-piece Brick Set', price: 49.00, originalPrice: 69.00, discount: 29, rating: 4.8, image: img('photo-1568667256549-094345857637'), category: 'toys', subCategory: 'blocks', brand: 'BrickWorks', inStock: true }),
  mk({ id: 'to-3', name: 'Coding Robot Kit', price: 119.00, rating: 4.6, image: img('photo-1596461404969-9ae70f2830c1'), category: 'toys', subCategory: 'educational', brand: 'Smartkids', inStock: true, badge: 'STEM' }),
  mk({ id: 'to-4', name: 'Ride-On Scooter', price: 79.00, rating: 4.5, image: img('photo-1560859251-d563a49c5e4a'), category: 'toys', subCategory: 'outdoor', brand: 'Zoomy', inStock: true }),
];

export const getProductsByCategory = (slug: string) =>
  PRODUCTS.filter(p => p.category === slug);

export const getProduct = (id: string) => PRODUCTS.find(p => p.id === id);

export const getFeatured = (n = 8) =>
  [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, n);

export const getDeals = (n = 8) =>
  PRODUCTS.filter(p => p.discount).sort((a, b) => (b.discount! - a.discount!)).slice(0, n);

export const getTrending = (n = 8) =>
  [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, n);
