import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
} from '@mui/material';
import { CartProvider, Product } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import { getProducts } from '@/service/api';
import { useCart } from '@/contexts/CartContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'hsl(0, 0%, 8%)',
      paper: 'hsl(0, 0%, 9.4%)',
    },
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
});

const IndexContent = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        // Map API data to Product interface
        const mappedProducts: Product[] = data.map((item: any) => ({
          id: item.productId,
          name: item.title,
          price: item.price,
          category: item.category,
          image: item.image,
          description: item.description,
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <Hero />

      <Container maxWidth="xl" id="products" sx={{ py: 6 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </Box>
        )}
      </Container>

      <Cart open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </Box>
  );
};

const Index = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <CartProvider>
        <IndexContent />
      </CartProvider>
    </ThemeProvider>
  );
};

export default Index;
