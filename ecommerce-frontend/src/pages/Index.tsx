import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('none');
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
          rating: item.rating,
        }));
        setProducts(mappedProducts);

        // Extract unique categories from products
        const uniqueCategories = Array.from(
          new Set(mappedProducts.map((product) => product.category))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = (() => {
    let filtered = selectedCategory === 'all'
      ? [...products]
      : products.filter(product => product.category === selectedCategory);

    // Apply sorting
    if (sortBy === 'price-low-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high-low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-high-low') {
      filtered.sort((a, b) => {
        const ratingA = a.rating?.rate || 0;
        const ratingB = b.rating?.rate || 0;
        return ratingB - ratingA;
      });
    } else if (sortBy === 'rating-low-high') {
      filtered.sort((a, b) => {
        const ratingA = a.rating?.rate || 0;
        const ratingB = b.rating?.rate || 0;
        return ratingA - ratingB;
      });
    }

    return filtered;
  })();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <Hero />

      <Container maxWidth="xl" id="products" sx={{ py: 6 }}>
        {/* Header with Category Filter and Sort */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
            }}
          >
            Our Products
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl
            size="small"
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                '& fieldset': {
                  borderColor: 'hsl(var(--border))',
                },
                '&:hover fieldset': {
                  borderColor: 'hsl(var(--netflix-red))',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'hsl(var(--netflix-red))',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'hsl(var(--muted-foreground))',
                '&.Mui-focused': {
                  color: 'hsl(var(--netflix-red))',
                },
              },
            }}
          >
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter"
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
              sx={{
                '& .MuiSelect-icon': {
                  color: 'hsl(var(--foreground))',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    '& .MuiMenuItem-root': {
                      color: 'hsl(var(--foreground))',
                      '&:hover': {
                        backgroundColor: 'hsl(var(--netflix-red) / 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'hsl(var(--netflix-red) / 0.2)',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--netflix-red) / 0.3)',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                '& fieldset': {
                  borderColor: 'hsl(var(--border))',
                },
                '&:hover fieldset': {
                  borderColor: 'hsl(var(--netflix-red))',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'hsl(var(--netflix-red))',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'hsl(var(--muted-foreground))',
                '&.Mui-focused': {
                  color: 'hsl(var(--netflix-red))',
                },
              },
            }}
          >
            <InputLabel id="sort-filter-label">Sort By</InputLabel>
            <Select
              labelId="sort-filter-label"
              id="sort-filter"
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                '& .MuiSelect-icon': {
                  color: 'hsl(var(--foreground))',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    '& .MuiMenuItem-root': {
                      color: 'hsl(var(--foreground))',
                      '&:hover': {
                        backgroundColor: 'hsl(var(--netflix-red) / 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'hsl(var(--netflix-red) / 0.2)',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--netflix-red) / 0.3)',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="none">Default</MenuItem>
              <MenuItem value="price-low-high">Price: Low to High</MenuItem>
              <MenuItem value="price-high-low">Price: High to Low</MenuItem>
              <MenuItem value="rating-high-low">Rating: High to Low</MenuItem>
              <MenuItem value="rating-low-high">Rating: Low to High</MenuItem>
            </Select>
          </FormControl>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              No products found in this category
            </Typography>
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
            {filteredProducts.map((product) => (
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
