export interface Brand {
  id: number;
  name: string;
  category: string;
  logo: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  establishedYear: string;
  status: 'approved' | 'pending' | 'rejected';
  registrationDate: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  description: string;
  images: string[];
  tags: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  status: 'active' | 'inactive' | 'draft';
}

export const BRANDS_DATA: Brand[] = [
  // Electronics Brands
  {
    id: 1,
    name: 'Apple',
    category: 'Electronics',
    logo: '/images/brands/electronics/apple.svg',
    description: 'Leading technology company known for innovative consumer electronics',
    website: 'https://www.apple.com',
    contactEmail: 'support@apple.com',
    contactPhone: '+1-800-275-2273',
    address: '1 Apple Park Way, Cupertino, CA 95014',
    establishedYear: '1976',
    status: 'approved',
    registrationDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Samsung',
    category: 'Electronics',
    logo: '/images/brands/electronics/samsung.svg',
    description: 'Global electronics manufacturer specializing in smartphones, TVs, and home appliances',
    website: 'https://www.samsung.com',
    contactEmail: 'support@samsung.com',
    contactPhone: '+1-800-726-7864',
    address: '1200 Samsung Blvd, Ridgefield Park, NJ 07660',
    establishedYear: '1938',
    status: 'approved',
    registrationDate: '2024-01-20'
  },
  {
    id: 3,
    name: 'Sony',
    category: 'Electronics',
    logo: '/images/brands/electronics/sony.svg',
    description: 'Multinational conglomerate corporation known for electronics, gaming, and entertainment',
    website: 'https://www.sony.com',
    contactEmail: 'support@sony.com',
    contactPhone: '+1-800-222-7669',
    address: '1730 N First St, San Jose, CA 95112',
    establishedYear: '1946',
    status: 'pending',
    registrationDate: '2024-02-01'
  },
  
  // Fashion Brands
  {
    id: 4,
    name: 'Nike',
    category: 'Fashion & Apparel',
    logo: '/images/brands/fashion/nike.svg',
    description: 'Global leader in athletic footwear, apparel, equipment, and accessories',
    website: 'https://www.nike.com',
    contactEmail: 'support@nike.com',
    contactPhone: '+1-800-344-6453',
    address: 'One Bowerman Dr, Beaverton, OR 97005',
    establishedYear: '1964',
    status: 'approved',
    registrationDate: '2024-01-10'
  },
  {
    id: 5,
    name: 'Adidas',
    category: 'Fashion & Apparel',
    logo: '/images/brands/fashion/adidas.svg',
    description: 'German multinational corporation that designs and manufactures shoes, clothing, and accessories',
    website: 'https://www.adidas.com',
    contactEmail: 'support@adidas.com',
    contactPhone: '+1-800-827-6653',
    address: '5055 N Greeley Ave, Portland, OR 97217',
    establishedYear: '1949',
    status: 'approved',
    registrationDate: '2024-01-12'
  },
  {
    id: 6,
    name: 'Puma',
    category: 'Fashion & Apparel',
    logo: '/images/brands/fashion/puma.svg',
    description: 'German multinational company that designs and manufactures athletic and casual footwear, apparel, and accessories',
    website: 'https://www.puma.com',
    contactEmail: 'support@puma.com',
    contactPhone: '+1-800-786-7862',
    address: '1255 Broadway, New York, NY 10001',
    establishedYear: '1948',
    status: 'pending',
    registrationDate: '2024-02-05'
  }
];

export const PRODUCTS_DATA: Product[] = [
  // Apple Products
  {
    id: 1,
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'Electronics',
    price: 999.99,
    stock: 50,
    sku: 'APP-IP15-001',
    description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system',
    images: [
      '/images/products/apple/iphone15-1.jpg',
      '/images/products/apple/iphone15-2.jpg',
      '/images/products/apple/iphone15-3.jpg'
    ],
    tags: 'smartphone, premium, apple, 5g, camera',
    weight: '0.187',
    dimensions: {
      length: '14.66',
      width: '7.08',
      height: '0.32'
    },
    status: 'active'
  },
  {
    id: 2,
    name: 'MacBook Air M2',
    brand: 'Apple',
    category: 'Electronics',
    price: 1299.99,
    stock: 25,
    sku: 'APP-MBA-002',
    description: 'Ultra-thin laptop with M2 chip, all-day battery life, and stunning Retina display',
    images: [
      '/images/products/apple/macbook-air-1.jpg',
      '/images/products/apple/macbook-air-2.jpg',
      '/images/products/apple/macbook-air-3.jpg'
    ],
    tags: 'laptop, mac, portable, m2, retina',
    weight: '1.24',
    dimensions: {
      length: '30.41',
      width: '21.24',
      height: '1.13'
    },
    status: 'active'
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    brand: 'Apple',
    category: 'Electronics',
    price: 249.99,
    stock: 100,
    sku: 'APP-APP-003',
    description: 'Wireless earbuds with active noise cancellation, spatial audio, and adaptive transparency',
    images: [
      '/images/products/apple/airpods-pro-1.jpg',
      '/images/products/apple/airpods-pro-2.jpg',
      '/images/products/apple/airpods-pro-3.jpg'
    ],
    tags: 'earbuds, wireless, noise-cancellation, audio',
    weight: '0.054',
    dimensions: {
      length: '4.56',
      width: '2.12',
      height: '2.18'
    },
    status: 'active'
  },
  
  // Samsung Products
  {
    id: 4,
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Electronics',
    price: 1199.99,
    stock: 40,
    sku: 'SAM-GS24-001',
    description: 'Premium Android smartphone with S Pen, advanced camera, and Galaxy AI features',
    images: [
      '/images/products/samsung/galaxy-s24-1.jpg',
      '/images/products/samsung/galaxy-s24-2.jpg',
      '/images/products/samsung/galaxy-s24-3.jpg'
    ],
    tags: 'smartphone, android, s-pen, camera, ultra',
    weight: '0.233',
    dimensions: {
      length: '16.25',
      width: '7.88',
      height: '0.83'
    },
    status: 'active'
  },
  {
    id: 5,
    name: 'Galaxy Tab S9',
    brand: 'Samsung',
    category: 'Electronics',
    price: 899.99,
    stock: 30,
    sku: 'SAM-GTS9-002',
    description: 'High-performance tablet with Dynamic AMOLED 2X display and S Pen included',
    images: [
      '/images/products/samsung/tab-s9-1.jpg',
      '/images/products/samsung/tab-s9-2.jpg',
      '/images/products/samsung/tab-s9-3.jpg'
    ],
    tags: 'tablet, android, s-pen, display, portable',
    weight: '0.492',
    dimensions: {
      length: '25.44',
      width: '16.53',
      height: '0.57'
    },
    status: 'active'
  },
  {
    id: 6,
    name: 'Galaxy Watch 6',
    brand: 'Samsung',
    category: 'Electronics',
    price: 349.99,
    stock: 60,
    sku: 'SAM-GW6-003',
    description: 'Advanced smartwatch with health monitoring, fitness tracking, and sleep analysis',
    images: [
      '/images/products/samsung/watch6-1.jpg',
      '/images/products/samsung/watch6-2.jpg',
      '/images/products/samsung/watch6-3.jpg'
    ],
    tags: 'smartwatch, fitness, health, wearable',
    weight: '0.033',
    dimensions: {
      length: '4.40',
      width: '3.80',
      height: '0.98'
    },
    status: 'active'
  },
  
  // Nike Products
  {
    id: 7,
    name: 'Air Jordan 1 Retro',
    brand: 'Nike',
    category: 'Fashion & Apparel',
    price: 169.99,
    stock: 80,
    sku: 'NIK-AJ1-001',
    description: 'Iconic basketball sneaker with classic design and premium leather construction',
    images: [
      '/images/products/nike/air-jordan1-1.jpg',
      '/images/products/nike/air-jordan1-2.jpg',
      '/images/products/nike/air-jordan1-3.jpg'
    ],
    tags: 'basketball, retro, classic, leather',
    weight: '0.45',
    dimensions: {
      length: '30.00',
      width: '10.00',
      height: '12.00'
    },
    status: 'active'
  },
  {
    id: 8,
    name: 'Nike Air Max 90',
    brand: 'Nike',
    category: 'Fashion & Apparel',
    price: 129.99,
    stock: 65,
    sku: 'NIK-AM90-002',
    description: 'Running shoe with visible Air Max cushioning and timeless silhouette',
    images: [
      '/images/products/nike/air-max90-1.jpg',
      '/images/products/nike/air-max90-2.jpg',
      '/images/products/nike/air-max90-3.jpg'
    ],
    tags: 'running, air-max, comfort, classic',
    weight: '0.38',
    dimensions: {
      length: '28.00',
      width: '9.50',
      height: '11.00'
    },
    status: 'active'
  },
  {
    id: 9,
    name: 'Nike Dri-FIT Tech Pack',
    brand: 'Nike',
    category: 'Fashion & Apparel',
    price: 89.99,
    stock: 120,
    sku: 'NIK-DFTP-003',
    description: 'Performance training shirt with moisture-wicking fabric and modern fit',
    images: [
      '/images/products/nike/dri-fit-1.jpg',
      '/images/products/nike/dri-fit-2.jpg',
      '/images/products/nike/dri-fit-3.jpg'
    ],
    tags: 'training, performance, moisture-wicking, athletic',
    weight: '0.15',
    dimensions: {
      length: '70.00',
      width: '50.00',
      height: '2.00'
    },
    status: 'active'
  }
];
