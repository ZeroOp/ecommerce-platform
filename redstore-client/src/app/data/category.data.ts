export interface SubCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  featured?: boolean;
}

export interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface CategoryData {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: SubCategory[];
  brands: Brand[];
  priceRanges: PriceRange[];
}

export const CATEGORIES_DATA: { [key: string]: CategoryData } = {
  fashion: {
    id: 'fashion',
    name: 'Fashion',
    description: 'Discover the latest trends in fashion with our curated collection of clothing, accessories, and footwear for every style and occasion.',
    icon: 'M13.5 5.5c1.09 0 2-.91 2-2s-.91-2-2-2-2 .91-2 2 .91 2 2 2zM9.91 8.31L7 23h2l1.5-7.5L13 18v5h2v-6.5l-2.5-2.5-.5 1.5z',
    subcategories: [
      { id: 'mens-clothing', name: "Men's Clothing", description: 'Shirts, jeans, suits, and more', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'womens-clothing', name: "Women's Clothing", description: 'Dresses, tops, skirts, and more', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'footwear', name: 'Footwear', description: 'Shoes, sneakers, boots, and sandals', icon: 'M12 2l-5.5 9h11z M17.5 11L12 20l-5.5-9z' },
      { id: 'accessories', name: 'Accessories', description: 'Bags, belts, watches, and jewelry', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'ethnic-wear', name: 'Ethnic Wear', description: 'Traditional and cultural clothing', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'sportswear', name: 'Sportswear', description: 'Athletic and activewear clothing', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' }
    ],
    brands: [
      { id: 'urban-style', name: 'Urban Style', featured: true },
      { id: 'denim-co', name: 'Denim Co', featured: true },
      { id: 'luxury-wear', name: 'Luxury Wear', featured: false },
      { id: 'summer-vibes', name: 'Summer Vibes', featured: false },
      { id: 'comfort-steps', name: 'Comfort Steps', featured: true },
      { id: 'cozy-wear', name: 'Cozy Wear', featured: false }
    ],
    priceRanges: [
      { id: 'under-25', label: 'Under $25', min: 0, max: 25 },
      { id: '25-50', label: '$25 - $50', min: 25, max: 50 },
      { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
      { id: '100-200', label: '$100 - $200', min: 100, max: 200 },
      { id: 'above-200', label: 'Above $200', min: 200, max: 9999 }
    ]
  },

  mobiles: {
    id: 'mobiles',
    name: 'Mobiles',
    description: 'Explore the latest smartphones with cutting-edge technology, cameras, and features from top brands.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    subcategories: [
      { id: 'smartphones', name: 'Smartphones', description: 'Latest Android and iOS phones', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'budget-phones', name: 'Budget Phones', description: 'Affordable smartphones under $300', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'gaming-phones', name: 'Gaming Phones', description: 'High-performance gaming devices', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'camera-phones', name: 'Camera Phones', description: 'Professional photography phones', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: '5g-phones', name: '5G Phones', description: 'Next-generation 5G connectivity', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'foldable-phones', name: 'Foldable Phones', description: 'Innovative foldable displays', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' }
    ],
    brands: [
      { id: 'techcorp', name: 'TechCorp', featured: true },
      { id: 'valuephone', name: 'ValuePhone', featured: false },
      { id: 'gametech', name: 'GameTech', featured: true },
      { id: 'phototech', name: 'PhotoTech', featured: false },
      { id: 'futuretech', name: 'FutureTech', featured: true },
      { id: 'innovatetech', name: 'InnovateTech', featured: false }
    ],
    priceRanges: [
      { id: 'under-200', label: 'Under $200', min: 0, max: 200 },
      { id: '200-500', label: '$200 - $500', min: 200, max: 500 },
      { id: '500-800', label: '$500 - $800', min: 500, max: 800 },
      { id: '800-1200', label: '$800 - $1200', min: 800, max: 1200 },
      { id: 'above-1200', label: 'Above $1200', min: 1200, max: 9999 }
    ]
  },

  electronics: {
    id: 'electronics',
    name: 'Electronics',
    description: 'Discover cutting-edge electronics including laptops, headphones, smart watches, and more.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    subcategories: [
      { id: 'laptops', name: 'Laptops', description: 'Gaming, business, and personal laptops', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'audio', name: 'Audio', description: 'Headphones, speakers, and audio accessories', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'wearables', name: 'Wearables', description: 'Smart watches and fitness trackers', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'tablets', name: 'Tablets', description: 'iPads and Android tablets', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'gaming', name: 'Gaming', description: 'Gaming consoles and accessories', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'accessories', name: 'Accessories', description: 'Cables, chargers, and more', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' }
    ],
    brands: [
      { id: 'computetech', name: 'ComputeTech', featured: true },
      { id: 'soundpro', name: 'SoundPro', featured: true },
      { id: 'timetech', name: 'TimeTech', featured: false },
      { id: 'tabletco', name: 'TabletCo', featured: false },
      { id: 'gamestation', name: 'GameStation', featured: true },
      { id: 'soundwave', name: 'SoundWave', featured: false }
    ],
    priceRanges: [
      { id: 'under-50', label: 'Under $50', min: 0, max: 50 },
      { id: '50-150', label: '$50 - $150', min: 50, max: 150 },
      { id: '150-500', label: '$150 - $500', min: 150, max: 500 },
      { id: '500-1000', label: '$500 - $1000', min: 500, max: 1000 },
      { id: 'above-1000', label: 'Above $1000', min: 1000, max: 9999 }
    ]
  },

  appliances: {
    id: 'appliances',
    name: 'Appliances',
    description: 'Home appliances to make your life easier with smart technology and energy efficiency.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    subcategories: [
      { id: 'kitchen', name: 'Kitchen Appliances', description: 'Refrigerators, ovens, microwaves', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'laundry', name: 'Laundry', description: 'Washing machines and dryers', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'cooling', name: 'Cooling & Heating', description: 'Air conditioners and heaters', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'small-appliances', name: 'Small Appliances', description: 'Coffee makers, blenders, mixers', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'cleaning', name: 'Cleaning', description: 'Vacuum cleaners and steam mops', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' }
    ],
    brands: [
      { id: 'hometech', name: 'HomeTech', featured: true },
      { id: 'cleantech', name: 'CleanTech', featured: true },
      { id: 'coolair', name: 'CoolAir', featured: false },
      { id: 'quickheat', name: 'QuickHeat', featured: false },
      { id: 'autoclean', name: 'AutoClean', featured: false },
      { id: 'brewmaster', name: 'BrewMaster', featured: true }
    ],
    priceRanges: [
      { id: 'under-100', label: 'Under $100', min: 0, max: 100 },
      { id: '100-300', label: '$100 - $300', min: 100, max: 300 },
      { id: '300-600', label: '$300 - $600', min: 300, max: 600 },
      { id: '600-1000', label: '$600 - $1000', min: 600, max: 1000 },
      { id: 'above-1000', label: 'Above $1000', min: 1000, max: 9999 }
    ]
  },

  sports: {
    id: 'sports',
    name: 'Sports',
    description: 'Gear up for your active lifestyle with sports equipment, fitness accessories, and athletic wear.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    subcategories: [
      { id: 'footwear', name: 'Sports Footwear', description: 'Running shoes, sneakers, and sports shoes', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'fitness', name: 'Fitness Equipment', description: 'Weights, yoga mats, and exercise gear', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'outdoor', name: 'Outdoor Sports', description: 'Camping, hiking, and adventure gear', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'team-sports', name: 'Team Sports', description: 'Football, basketball, cricket equipment', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'accessories', name: 'Sports Accessories', description: 'Bottles, bags, and fitness trackers', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' }
    ],
    brands: [
      { id: 'speedrun', name: 'SpeedRun', featured: true },
      { id: 'zenfit', name: 'ZenFit', featured: false },
      { id: 'powerfit', name: 'PowerFit', featured: true },
      { id: 'prosport', name: 'ProSport', featured: false },
      { id: 'trackfit', name: 'TrackFit', featured: true },
      { id: 'aquasport', name: 'AquaSport', featured: false }
    ],
    priceRanges: [
      { id: 'under-25', label: 'Under $25', min: 0, max: 25 },
      { id: '25-50', label: '$25 - $50', min: 25, max: 50 },
      { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
      { id: '100-200', label: '$100 - $200', min: 100, max: 200 },
      { id: 'above-200', label: 'Above $200', min: 200, max: 9999 }
    ]
  },

  books: {
    id: 'books',
    name: 'Books',
    description: 'Expand your horizons with our vast collection of books across all genres and subjects.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    subcategories: [
      { id: 'fiction', name: 'Fiction', description: 'Novels, stories, and literature', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'non-fiction', name: 'Non-Fiction', description: 'Biographies, history, and educational books', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'academic', name: 'Academic', description: 'Textbooks and reference materials', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'children', name: 'Children Books', description: 'Kids stories and educational books', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'self-help', name: 'Self Help', description: 'Personal development and motivation', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' }
    ],
    brands: [
      { id: 'bestbooks', name: 'BestBooks', featured: true },
      { id: 'techbooks', name: 'TechBooks', featured: false },
      { id: 'foodbooks', name: 'FoodBooks', featured: false },
      { id: 'fictionhouse', name: 'FictionHouse', featured: true },
      { id: 'lifebooks', name: 'LifeBooks', featured: false },
      { id: 'artbooks', name: 'ArtBooks', featured: false }
    ],
    priceRanges: [
      { id: 'under-15', label: 'Under $15', min: 0, max: 15 },
      { id: '15-30', label: '$15 - $30', min: 15, max: 30 },
      { id: '30-50', label: '$30 - $50', min: 30, max: 50 },
      { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
      { id: 'above-100', label: 'Above $100', min: 100, max: 9999 }
    ]
  },

  furniture: {
    id: 'furniture',
    name: 'Furniture',
    description: 'Transform your living space with our stylish and functional furniture collection.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    subcategories: [
      { id: 'living-room', name: 'Living Room', description: 'Sofas, chairs, and entertainment centers', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'bedroom', name: 'Bedroom', description: 'Beds, wardrobes, and nightstands', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'dining', name: 'Dining Room', description: 'Tables, chairs, and dining sets', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'office', name: 'Office Furniture', description: 'Desks, chairs, and storage solutions', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'storage', name: 'Storage', description: 'Shelves, cabinets, and organizers', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' }
    ],
    brands: [
      { id: 'comforthome', name: 'ComfortHome', featured: true },
      { id: 'workspace', name: 'WorkSpace', featured: false },
      { id: 'diningplus', name: 'DiningPlus', featured: true },
      { id: 'storagepro', name: 'StoragePro', featured: false },
      { id: 'sleepwell', name: 'SleepWell', featured: true },
      { id: 'livingstyle', name: 'LivingStyle', featured: false }
    ],
    priceRanges: [
      { id: 'under-100', label: 'Under $100', min: 0, max: 100 },
      { id: '100-300', label: '$100 - $300', min: 100, max: 300 },
      { id: '300-600', label: '$300 - $600', min: 300, max: 600 },
      { id: '600-1000', label: '$600 - $1000', min: 600, max: 1000 },
      { id: 'above-1000', label: 'Above $1000', min: 1000, max: 9999 }
    ]
  },

  beauty: {
    id: 'beauty',
    name: 'Beauty',
    description: 'Enhance your natural beauty with premium skincare, makeup, and personal care products.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    subcategories: [
      { id: 'skincare', name: 'Skincare', description: 'Face creams, serums, and treatments', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'makeup', name: 'Makeup', description: 'Cosmetics, foundations, and color products', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'haircare', name: 'Hair Care', description: 'Shampoos, conditioners, and styling products', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'fragrance', name: 'Fragrance', description: 'Perfumes and colognes', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'personal-care', name: 'Personal Care', description: 'Bath products and personal hygiene', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' }
    ],
    brands: [
      { id: 'glowskin', name: 'GlowSkin', featured: true },
      { id: 'colorpop', name: 'ColorPop', featured: false },
      { id: 'silkyhair', name: 'SilkyHair', featured: true },
      { id: 'scentlux', name: 'ScentLux', featured: false },
      { id: 'protools', name: 'ProTools', featured: false },
      { id: 'freshskin', name: 'FreshSkin', featured: true }
    ],
    priceRanges: [
      { id: 'under-20', label: 'Under $20', min: 0, max: 20 },
      { id: '20-40', label: '$20 - $40', min: 20, max: 40 },
      { id: '40-75', label: '$40 - $75', min: 40, max: 75 },
      { id: '75-150', label: '$75 - $150', min: 75, max: 150 },
      { id: 'above-150', label: 'Above $150', min: 150, max: 9999 }
    ]
  },

  toys: {
    id: 'toys',
    name: 'Toys',
    description: 'Spark imagination and creativity with our exciting collection of toys for all ages.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    subcategories: [
      { id: 'educational', name: 'Educational Toys', description: 'Learning and development toys', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'vehicles', name: 'Vehicles', description: 'Cars, trucks, and remote control toys', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'games', name: 'Games & Puzzles', description: 'Board games and puzzles', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'arts-crafts', name: 'Arts & Crafts', description: 'Creative and artistic supplies', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
      { id: 'dolls', name: 'Dolls & Figures', description: 'Action figures and dolls', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' }
    ],
    brands: [
      { id: 'buildfun', name: 'BuildFun', featured: true },
      { id: 'speedtoys', name: 'SpeedToys', featured: false },
      { id: 'gamenight', name: 'GameNight', featured: true },
      { id: 'creativekids', name: 'CreativeKids', featured: false },
      { id: 'braintease', name: 'BrainTease', featured: false },
      { id: 'dreamhouse', name: 'DreamHouse', featured: true }
    ],
    priceRanges: [
      { id: 'under-15', label: 'Under $15', min: 0, max: 15 },
      { id: '15-30', label: '$15 - $30', min: 15, max: 30 },
      { id: '30-50', label: '$30 - $50', min: 30, max: 50 },
      { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
      { id: 'above-100', label: 'Above $100', min: 100, max: 9999 }
    ]
  }
};
