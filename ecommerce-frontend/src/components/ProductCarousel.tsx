import { Box, Typography } from '@mui/material';
import { Product } from '@/contexts/CartContext';
import ProductCard from './ProductCard';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { useRef } from 'react';

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

const ProductCarousel = ({ title, products }: ProductCarouselProps) => {
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Box sx={{ mb: 6 }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'hsl(var(--foreground))',
            mb: 3,
            fontSize: { xs: '1.5rem', md: '2rem' },
          }}
        >
          {title}
        </Typography>
      </motion.div>

      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 2,
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'hsl(var(--background))',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'hsl(var(--muted))',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: 'hsl(var(--netflix-red))',
            },
          },
        }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProductCard product={product} onAddToCart={addToCart} />
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default ProductCarousel;
