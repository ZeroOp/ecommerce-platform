export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  brand: string;
  inStock: boolean;
  discount?: number;
  badge?: string;
}

export const PRODUCTS_DATA: { [category: string]: Product[] } = {
  fashion: [
    {
      id: 'f1',
      name: 'Premium Cotton T-Shirt',
      price: 29.99,
      originalPrice: 39.99,
      rating: 4.5,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      category: 'fashion',
      brand: 'Urban Style',
      inStock: true,
      discount: 25,
      badge: 'Best Seller'
    },
    {
      id: 'f2',
      name: 'Slim Fit Denim Jeans',
      price: 79.99,
      rating: 4.3,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=300&fit=crop',
      category: 'fashion',
      brand: 'Denim Co',
      inStock: true
    },
    {
      id: 'f3',
      name: 'Leather Jacket',
      price: 199.99,
      originalPrice: 299.99,
      rating: 4.7,
      reviews: 412,
      image: 'https://images.unsplash.com/photo-1551028719-001673ce3d33?w=300&h=300&fit=crop',
      category: 'fashion',
      brand: 'Luxury Wear',
      inStock: true,
      discount: 33,
      badge: 'Limited Edition'
    },
    {
      id: 'f4',
      name: 'Summer Dress',
      price: 49.99,
      rating: 4.4,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
      category: 'fashion',
      brand: 'Summer Vibes',
      inStock: true
    },
    {
      id: 'f5',
      name: 'Classic Sneakers',
      price: 89.99,
      originalPrice: 119.99,
      rating: 4.6,
      reviews: 523,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
      category: 'fashion',
      brand: 'Comfort Steps',
      inStock: true,
      discount: 25,
      badge: 'Trending'
    },
    {
      id: 'f6',
      name: 'Wool Sweater',
      price: 69.99,
      rating: 4.8,
      reviews: 298,
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop',
      category: 'fashion',
      brand: 'Cozy Wear',
      inStock: false,
      badge: 'Out of Stock'
    }
  ],
  
  mobiles: [
    {
      id: 'm1',
      name: 'Smartphone Pro Max',
      price: 999.99,
      originalPrice: 1299.99,
      rating: 4.8,
      reviews: 1247,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
      category: 'mobiles',
      brand: 'TechCorp',
      inStock: true,
      discount: 23,
      badge: 'Hot Deal'
    },
    {
      id: 'm2',
      name: 'Budget Smartphone',
      price: 199.99,
      rating: 4.2,
      reviews: 892,
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&h=300&fit=crop',
      category: 'mobiles',
      brand: 'ValuePhone',
      inStock: true
    },
    {
      id: 'm3',
      name: 'Gaming Phone Elite',
      price: 799.99,
      rating: 4.7,
      reviews: 634,
      image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop',
      category: 'mobiles',
      brand: 'GameTech',
      inStock: true,
      badge: 'Gaming Choice'
    },
    {
      id: 'm4',
      name: 'Camera Phone Pro',
      price: 899.99,
      originalPrice: 1099.99,
      rating: 4.6,
      reviews: 445,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      category: 'mobiles',
      brand: 'PhotoTech',
      inStock: true,
      discount: 18
    },
    {
      id: 'm5',
      name: '5G Smartphone',
      price: 699.99,
      rating: 4.5,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1605236453806-b25a3db77164?w=300&h=300&fit=crop',
      category: 'mobiles',
      brand: 'FutureTech',
      inStock: true
    },
    {
      id: 'm6',
      name: 'Foldable Phone',
      price: 1499.99,
      rating: 4.9,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      category: 'mobiles',
      brand: 'InnovateTech',
      inStock: true,
      badge: 'New Arrival'
    }
  ],

  electronics: [
    {
      id: 'e1',
      name: 'Laptop Pro 15"',
      price: 1299.99,
      originalPrice: 1599.99,
      rating: 4.7,
      reviews: 892,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop',
      category: 'electronics',
      brand: 'ComputeTech',
      inStock: true,
      discount: 19,
      badge: 'Best Choice'
    },
    {
      id: 'e2',
      name: 'Wireless Headphones',
      price: 149.99,
      rating: 4.5,
      reviews: 1234,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'electronics',
      brand: 'SoundPro',
      inStock: true
    },
    {
      id: 'e3',
      name: 'Smart Watch Ultra',
      price: 399.99,
      originalPrice: 499.99,
      rating: 4.6,
      reviews: 567,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      category: 'electronics',
      brand: 'TimeTech',
      inStock: true,
      discount: 20,
      badge: 'Popular'
    },
    {
      id: 'e4',
      name: 'Tablet Pro 12"',
      price: 799.99,
      rating: 4.4,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
      category: 'electronics',
      brand: 'TabletCo',
      inStock: true
    },
    {
      id: 'e5',
      name: 'Gaming Console',
      price: 499.99,
      rating: 4.8,
      reviews: 1456,
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=300&fit=crop',
      category: 'electronics',
      brand: 'GameStation',
      inStock: true,
      badge: 'Gaming Hit'
    },
    {
      id: 'e6',
      name: 'Bluetooth Speaker',
      price: 79.99,
      rating: 4.3,
      reviews: 789,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
      category: 'electronics',
      brand: 'SoundWave',
      inStock: true
    }
  ],

  appliances: [
    {
      id: 'a1',
      name: 'Smart Refrigerator',
      price: 1299.99,
      originalPrice: 1599.99,
      rating: 4.6,
      reviews: 345,
      image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=300&h=300&fit=crop',
      category: 'appliances',
      brand: 'HomeTech',
      inStock: true,
      discount: 19,
      badge: 'Energy Efficient'
    },
    {
      id: 'a2',
      name: 'Washing Machine Pro',
      price: 699.99,
      rating: 4.5,
      reviews: 567,
      image: 'https://images.unsplash.com/photo-1584467736005-0cafce138ee2?w=300&h=300&fit=crop',
      category: 'appliances',
      brand: 'CleanTech',
      inStock: true
    },
    {
      id: 'a3',
      name: 'Air Conditioner',
      price: 899.99,
      rating: 4.4,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1580924929044-7b7a4a3657c6?w=300&h=300&fit=crop',
      category: 'appliances',
      brand: 'CoolAir',
      inStock: true
    },
    {
      id: 'a4',
      name: 'Microwave Oven',
      price: 199.99,
      rating: 4.3,
      reviews: 456,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      category: 'appliances',
      brand: 'QuickHeat',
      inStock: true
    },
    {
      id: 'a5',
      name: 'Dishwasher',
      price: 599.99,
      originalPrice: 799.99,
      rating: 4.7,
      reviews: 123,
      image: 'https://images.unsplash.com/photo-1580924929044-7b7a4a3657c6?w=300&h=300&fit=crop',
      category: 'appliances',
      brand: 'AutoClean',
      inStock: true,
      discount: 25
    },
    {
      id: 'a6',
      name: 'Coffee Maker',
      price: 149.99,
      rating: 4.8,
      reviews: 890,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
      category: 'appliances',
      brand: 'BrewMaster',
      inStock: true,
      badge: 'Morning Essential'
    }
  ],

  sports: [
    {
      id: 's1',
      name: 'Running Shoes Pro',
      price: 129.99,
      originalPrice: 169.99,
      rating: 4.6,
      reviews: 678,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      category: 'sports',
      brand: 'SpeedRun',
      inStock: true,
      discount: 24,
      badge: 'Athlete Choice'
    },
    {
      id: 's2',
      name: 'Yoga Mat Premium',
      price: 39.99,
      rating: 4.5,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&h=300&fit=crop',
      category: 'sports',
      brand: 'ZenFit',
      inStock: true
    },
    {
      id: 's3',
      name: 'Dumbbells Set',
      price: 89.99,
      rating: 4.4,
      reviews: 456,
      image: 'https://images.unsplash.com/photo-1517891905240-472988babdf9?w=300&h=300&fit=crop',
      category: 'sports',
      brand: 'PowerFit',
      inStock: true
    },
    {
      id: 's4',
      name: 'Tennis Racket',
      price: 159.99,
      rating: 4.7,
      reviews: 123,
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=300&h=300&fit=crop',
      category: 'sports',
      brand: 'ProSport',
      inStock: true,
      badge: 'Pro Quality'
    },
    {
      id: 's5',
      name: 'Fitness Tracker',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.3,
      reviews: 567,
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop',
      category: 'sports',
      brand: 'TrackFit',
      inStock: true,
      discount: 20
    },
    {
      id: 's6',
      name: 'Swimming Goggles',
      price: 29.99,
      rating: 4.5,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      category: 'sports',
      brand: 'AquaSport',
      inStock: true
    }
  ],

  books: [
    {
      id: 'b1',
      name: 'Bestseller Novel',
      price: 19.99,
      originalPrice: 29.99,
      rating: 4.8,
      reviews: 1234,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
      category: 'books',
      brand: 'BestBooks',
      inStock: true,
      discount: 33,
      badge: 'Bestseller'
    },
    {
      id: 'b2',
      name: 'Programming Guide',
      price: 49.99,
      rating: 4.6,
      reviews: 567,
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=300&fit=crop',
      category: 'books',
      brand: 'TechBooks',
      inStock: true
    },
    {
      id: 'b3',
      name: 'Cookbook Deluxe',
      price: 34.99,
      rating: 4.5,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
      category: 'books',
      brand: 'FoodBooks',
      inStock: true
    },
    {
      id: 'b4',
      name: 'Science Fiction',
      price: 24.99,
      rating: 4.7,
      reviews: 890,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
      category: 'books',
      brand: 'FictionHouse',
      inStock: true,
      badge: 'Award Winner'
    },
    {
      id: 'b5',
      name: 'Self Help Guide',
      price: 29.99,
      rating: 4.4,
      reviews: 456,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      category: 'books',
      brand: 'LifeBooks',
      inStock: true
    },
    {
      id: 'b6',
      name: 'Art History',
      price: 59.99,
      originalPrice: 79.99,
      rating: 4.9,
      reviews: 123,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop',
      category: 'books',
      brand: 'ArtBooks',
      inStock: true,
      discount: 25
    }
  ],

  furniture: [
    {
      id: 'f1',
      name: 'Modern Sofa',
      price: 899.99,
      originalPrice: 1299.99,
      rating: 4.6,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      category: 'furniture',
      brand: 'ComfortHome',
      inStock: true,
      discount: 31,
      badge: 'Limited Stock'
    },
    {
      id: 'f2',
      name: 'Office Chair',
      price: 299.99,
      rating: 4.5,
      reviews: 567,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      category: 'furniture',
      brand: 'WorkSpace',
      inStock: true
    },
    {
      id: 'f3',
      name: 'Dining Table Set',
      price: 1299.99,
      rating: 4.7,
      reviews: 123,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      category: 'furniture',
      brand: 'DiningPlus',
      inStock: true,
      badge: 'Premium'
    },
    {
      id: 'f4',
      name: 'Bookshelf',
      price: 199.99,
      rating: 4.4,
      reviews: 456,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      category: 'furniture',
      brand: 'StoragePro',
      inStock: true
    },
    {
      id: 'f5',
      name: 'Bed Frame Queen',
      price: 599.99,
      originalPrice: 799.99,
      rating: 4.8,
      reviews: 345,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      category: 'furniture',
      brand: 'SleepWell',
      inStock: true,
      discount: 25
    },
    {
      id: 'f6',
      name: 'Coffee Table',
      price: 249.99,
      rating: 4.3,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      category: 'furniture',
      brand: 'LivingStyle',
      inStock: true
    }
  ],

  beauty: [
    {
      id: 'b1',
      name: 'Face Cream Premium',
      price: 49.99,
      originalPrice: 69.99,
      rating: 4.7,
      reviews: 892,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
      category: 'beauty',
      brand: 'GlowSkin',
      inStock: true,
      discount: 29,
      badge: 'Top Rated'
    },
    {
      id: 'b2',
      name: 'Lipstick Set',
      price: 29.99,
      rating: 4.5,
      reviews: 567,
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=300&fit=crop',
      category: 'beauty',
      brand: 'ColorPop',
      inStock: true
    },
    {
      id: 'b3',
      name: 'Hair Serum',
      price: 34.99,
      rating: 4.6,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1560069007-67bae283cd98?w=300&h=300&fit=crop',
      category: 'beauty',
      brand: 'SilkyHair',
      inStock: true
    },
    {
      id: 'b4',
      name: 'Perfume Luxury',
      price: 89.99,
      originalPrice: 119.99,
      rating: 4.8,
      reviews: 445,
      image: 'https://images.unsplash.com/photo-1528747355501-931d040540fd?w=300&h=300&fit=crop',
      category: 'beauty',
      brand: 'ScentLux',
      inStock: true,
      discount: 25,
      badge: 'Exclusive'
    },
    {
      id: 'b5',
      name: 'Makeup Brushes Set',
      price: 39.99,
      rating: 4.4,
      reviews: 345,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
      category: 'beauty',
      brand: 'ProTools',
      inStock: true
    },
    {
      id: 'b6',
      name: 'Face Mask Pack',
      price: 24.99,
      rating: 4.5,
      reviews: 678,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
      category: 'beauty',
      brand: 'FreshSkin',
      inStock: true,
      badge: 'Trending'
    }
  ],

  toys: [
    {
      id: 't1',
      name: 'Building Blocks Set',
      price: 49.99,
      originalPrice: 69.99,
      rating: 4.8,
      reviews: 567,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop',
      category: 'toys',
      brand: 'BuildFun',
      inStock: true,
      discount: 29,
      badge: 'Educational'
    },
    {
      id: 't2',
      name: 'Remote Control Car',
      price: 79.99,
      rating: 4.6,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop',
      category: 'toys',
      brand: 'SpeedToys',
      inStock: true
    },
    {
      id: 't3',
      name: 'Board Game Collection',
      price: 34.99,
      rating: 4.5,
      reviews: 456,
      image: 'https://images.unsplash.com/photo-1526428126939-772c631d8b2f?w=300&h=300&fit=crop',
      category: 'toys',
      brand: 'GameNight',
      inStock: true
    },
    {
      id: 't4',
      name: 'Art Supplies Kit',
      price: 29.99,
      rating: 4.7,
      reviews: 123,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop',
      category: 'toys',
      brand: 'CreativeKids',
      inStock: true,
      badge: 'Creative'
    },
    {
      id: 't5',
      name: 'Puzzle Set',
      price: 19.99,
      rating: 4.4,
      reviews: 345,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop',
      category: 'toys',
      brand: 'BrainTease',
      inStock: true
    },
    {
      id: 't6',
      name: 'Doll House',
      price: 89.99,
      originalPrice: 119.99,
      rating: 4.9,
      reviews: 678,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop',
      category: 'toys',
      brand: 'DreamHouse',
      inStock: true,
      discount: 25,
      badge: 'Best Gift'
    }
  ]
};
