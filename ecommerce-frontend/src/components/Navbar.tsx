import { AppBar, Toolbar, Typography, Badge, IconButton, Box, Button } from '@mui/material';
import { ShoppingCart, User, LogOut, Shield } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavbarProps {
  onCartClick: () => void;
}

const Navbar = ({ onCartClick }: NavbarProps) => {
  const { getCartCount } = useCart();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'linear-gradient(180deg, rgba(20, 20, 20, 1) 0%, rgba(20, 20, 20, 0) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'hsl(var(--netflix-red))',
                letterSpacing: '-0.5px',
                cursor: 'pointer',
                textShadow: '0 0 20px hsl(var(--netflix-red-glow) / 0.5)',
              }}
              onClick={() => navigate('/')}
            >
              STREAMSHOP
            </Typography>
          </motion.div>

          {/* Admin Link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Button
              onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/admin/login')}
              startIcon={<Shield size={18} />}
              sx={{
                color: 'hsl(var(--foreground))',
                textTransform: 'none',
                fontWeight: 600,
                display: { xs: 'none', md: 'flex' },
                '&:hover': {
                  backgroundColor: 'hsl(0, 0%, 15%)',
                  color: 'hsl(var(--netflix-red))',
                },
              }}
            >
              Admin
            </Button>
          </motion.div>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <User size={20} color="hsl(var(--foreground))" />
                  <Typography
                    sx={{
                      color: 'hsl(var(--foreground))',
                      fontWeight: 500,
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {user?.username}
                  </Typography>
                </Box>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    color: 'hsl(var(--foreground))',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: 'hsl(var(--netflix-red))',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <LogOut size={24} />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'hsl(var(--foreground))',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'hsl(0, 0%, 15%)',
                    },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                  sx={{
                    backgroundColor: 'hsl(var(--netflix-red))',
                    color: 'hsl(var(--foreground))',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'hsl(var(--netflix-red-hover))',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <IconButton
              onClick={onCartClick}
              sx={{
                color: 'hsl(var(--foreground))',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: 'hsl(var(--netflix-red))',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Badge
                badgeContent={getCartCount()}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: 'hsl(var(--netflix-red))',
                    color: 'hsl(var(--foreground))',
                    fontWeight: 600,
                    boxShadow: '0 0 10px hsl(var(--netflix-red-glow) / 0.6)',
                  },
                }}
              >
                <ShoppingCart size={28} />
              </Badge>
            </IconButton>
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
