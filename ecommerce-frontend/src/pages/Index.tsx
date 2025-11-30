import { useState } from 'react';
import { Container, Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCarousel from '@/components/ProductCarousel';
import Cart from '@/components/Cart';
import { products, categories } from '@/data/products';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'hsl(0, 0%, 8%)',
      paper: 'hsl(0, 0%, 9.4%)',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
});

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <CartProvider>
        <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
          <Navbar onCartClick={() => setIsCartOpen(true)} />
          <Hero />
          
          <Container maxWidth="xl" id="products" sx={{ py: 6 }}>
            {categories.map((category) => {
              const categoryProducts = products.filter(
                (product) => product.category === category
              );
              return (
                <ProductCarousel
                  key={category}
                  title={category}
                  products={categoryProducts}
                />
              );
            })}
          </Container>

          <Cart open={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </Box>
      </CartProvider>
    </ThemeProvider>
  );
};

export default Index;
