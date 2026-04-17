import { Brand } from '../core/models/product.model';

export const BRANDS: Brand[] = [
  { id: 'b-urban',    name: 'Urban Style',   logo: '👕', description: 'Streetwear, redefined.',            categories: ['fashion'],      productCount: 124, rating: 4.5, status: 'active'  },
  { id: 'b-denim',    name: 'Denim Co',      logo: '👖', description: 'Premium denim essentials.',          categories: ['fashion'],      productCount: 88,  rating: 4.4, status: 'active'  },
  { id: 'b-nova',     name: 'Nova',          logo: '📱', description: 'Next-gen mobile technology.',        categories: ['mobiles'],      productCount: 56,  rating: 4.8, status: 'active'  },
  { id: 'b-apex',     name: 'Apex',          logo: '💻', description: 'Performance computing.',             categories: ['electronics'],  productCount: 41,  rating: 4.7, status: 'active'  },
  { id: 'b-sonic',    name: 'Sonic',         logo: '🎧', description: 'Studio-grade audio.',                categories: ['electronics', 'mobiles'], productCount: 72, rating: 4.6, status: 'active' },
  { id: 'b-bloom',    name: 'Bloom',         logo: '🌸', description: 'Elevated women\u2019s fashion.',     categories: ['fashion'],      productCount: 63,  rating: 4.6, status: 'active'  },
  { id: 'b-velocity', name: 'Velocity',      logo: '🚴', description: 'Built for the ride.',                 categories: ['sports'],       productCount: 22,  rating: 4.6, status: 'active'  },
  { id: 'b-ironworks',name: 'IronWorks',     logo: '🏋️', description: 'Forged for strength.',               categories: ['sports'],       productCount: 37,  rating: 4.8, status: 'active'  },
  { id: 'b-luxe',     name: 'Luxe',          logo: '💄', description: 'Bold beauty you can wear.',           categories: ['beauty'],       productCount: 119, rating: 4.5, status: 'active'  },
  { id: 'b-glow',     name: 'Glow',          logo: '✨', description: 'Clean skincare that works.',          categories: ['beauty'],       productCount: 64,  rating: 4.7, status: 'active'  },
  { id: 'b-homehaus', name: 'HomeHaus',      logo: '🛋️', description: 'Comfort crafted for living.',         categories: ['furniture'],    productCount: 31,  rating: 4.4, status: 'pending' },
  { id: 'b-brickworks',name: 'BrickWorks',   logo: '🧱', description: 'Imagination, one brick at a time.',   categories: ['toys'],         productCount: 48,  rating: 4.8, status: 'active'  },
];
