import { Product } from '@/contexts/CartContext';

export const products: Product[] = [
  // Trending Now
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    price: 299.99,
    category: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  },
  {
    id: '2',
    name: 'Smart Watch Ultra',
    price: 499.99,
    category: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  },
  {
    id: '3',
    name: 'Premium Camera',
    price: 1299.99,
    category: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
  },
  {
    id: '4',
    name: 'Designer Sunglasses',
    price: 199.99,
    category: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
  },
  {
    id: '5',
    name: 'Leather Backpack',
    price: 149.99,
    category: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
  },
  
  // Top Picks for You
  {
    id: '6',
    name: 'Mechanical Keyboard',
    price: 179.99,
    category: 'Top Picks for You',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
  },
  {
    id: '7',
    name: 'Premium Coffee Maker',
    price: 249.99,
    category: 'Top Picks for You',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
  },
  {
    id: '8',
    name: 'Fitness Tracker',
    price: 129.99,
    category: 'Top Picks for You',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
  },
  {
    id: '9',
    name: 'Portable Speaker',
    price: 89.99,
    category: 'Top Picks for You',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
  },
  {
    id: '10',
    name: 'Wireless Mouse',
    price: 69.99,
    category: 'Top Picks for You',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
  },
  
  // Tech Essentials
  {
    id: '11',
    name: 'USB-C Hub',
    price: 79.99,
    category: 'Tech Essentials',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80',
  },
  {
    id: '12',
    name: 'Desk Lamp LED',
    price: 59.99,
    category: 'Tech Essentials',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
  },
  {
    id: '13',
    name: 'Phone Stand',
    price: 29.99,
    category: 'Tech Essentials',
    image: 'https://images.unsplash.com/photo-1605367163938-d3a7a6ec8da3?w=800&q=80',
  },
  {
    id: '14',
    name: 'Cable Organizer',
    price: 19.99,
    category: 'Tech Essentials',
    image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&q=80',
  },
  {
    id: '15',
    name: 'Laptop Sleeve',
    price: 39.99,
    category: 'Tech Essentials',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
  },
  
  // Home & Living
  {
    id: '16',
    name: 'Scented Candles Set',
    price: 44.99,
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1602874801006-dribbble-gif?w=800&q=80',
  },
  {
    id: '17',
    name: 'Throw Pillow',
    price: 34.99,
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
  },
  {
    id: '18',
    name: 'Wall Art Print',
    price: 89.99,
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=800&q=80',
  },
  {
    id: '19',
    name: 'Plant Pot Set',
    price: 49.99,
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80',
  },
  {
    id: '20',
    name: 'Cozy Blanket',
    price: 69.99,
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1610328447965-c196a8e6a4b3?w=800&q=80',
  },
];

export const categories = [
  'Trending Now',
  'Top Picks for You',
  'Tech Essentials',
  'Home & Living',
];
