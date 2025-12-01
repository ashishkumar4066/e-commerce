import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'hsl(var(--card))',
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid hsl(var(--border))',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid hsl(var(--netflix-red))',
            boxShadow: '0 8px 30px hsl(var(--netflix-red-glow) / 0.3)',
          },
        }}
      >
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            p: 2,
          }}
        >
          <CardMedia
            component="img"
            image={product.image}
            alt={product.name}
            sx={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
        <CardContent
          sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'hsl(var(--foreground))',
              mb: 1,
              fontSize: '1rem',
              lineHeight: 1.3,
              minHeight: '2.6em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.name}
          </Typography>

          {product.description && (
            <Typography
              variant="body2"
              sx={{
                color: 'hsl(var(--muted-foreground))',
                mb: 2,
                fontSize: '0.875rem',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {product.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'hsl(var(--netflix-red))',
                mb: 2,
              }}
            >
              ₹ {product.price.toFixed(2)}
            </Typography>

            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingCart size={18} />}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              sx={{
                backgroundColor: 'hsl(var(--netflix-red))',
                color: 'hsl(var(--foreground))',
                fontWeight: 600,
                textTransform: 'none',
                py: 1,
                '&:hover': {
                  backgroundColor: 'hsl(var(--netflix-red-hover))',
                },
              }}
            >
              Add to Cart
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
