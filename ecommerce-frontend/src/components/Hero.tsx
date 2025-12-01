import { Box, Container, Typography, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const backgroundImages = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&q=80',
];

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '85vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        mt: 8,
      }}
    >
      {/* Background Image Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.3) 0%, rgba(20, 20, 20, 0.8) 50%, rgba(20, 20, 20, 1) 100%)',
              },
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '5rem' },
              fontWeight: 800,
              color: 'hsl(var(--foreground))',
              mb: 2,
              lineHeight: 1.1,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            }}
          >
            Premium Products.
            <br />
            <Box component="span" sx={{ color: 'hsl(var(--netflix-red))' }}>
              Unmatched Quality.
            </Box>
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Typography
            variant="h5"
            sx={{
              color: 'hsl(var(--muted-foreground))',
              mb: 4,
              maxWidth: '600px',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
            }}
          >
            Discover our curated collection of premium products designed for those who demand excellence.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            onClick={scrollToProducts}
            variant="contained"
            size="large"
            endIcon={<ArrowRight size={20} />}
            sx={{
              backgroundColor: 'hsl(var(--netflix-red))',
              color: 'hsl(var(--foreground))',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '4px',
              textTransform: 'none',
              boxShadow: '0 0 30px hsl(var(--netflix-red-glow) / 0.5)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'hsl(var(--netflix-red-hover))',
                transform: 'translateY(-2px)',
                boxShadow: '0 0 40px hsl(var(--netflix-red-glow) / 0.7)',
              },
            }}
          >
            Shop Now
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Hero;
