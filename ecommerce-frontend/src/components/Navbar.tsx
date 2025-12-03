import { AppBar, Toolbar, Typography, Badge, IconButton, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { ShoppingCart, User, LogOut, Shield } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface NavbarProps {
  onCartClick: () => void;
}

const Navbar = ({ onCartClick }: NavbarProps) => {
  const { getCartCount } = useCart();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    if (isAdmin) {
      setShowLogoutConfirm(true);
    } else {
      logout();
      navigate('/login');
    }
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
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
            <Tooltip title={isAdmin ? 'Go to Admin Dashboard' : 'Admin Login'} arrow>
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
                {isAdmin ? 'Dashboard' : 'Admin'}
              </Button>
            </Tooltip>
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
                <Tooltip title="Logout" arrow>
                  <IconButton
                    onClick={handleLogoutClick}
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
                </Tooltip>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Sign in to your account" arrow>
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
                </Tooltip>
                <Tooltip title="Create a new account" arrow>
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
                </Tooltip>
              </Box>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tooltip title="View Shopping Cart" arrow>
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
            </Tooltip>
          </motion.div>
        </Box>
      </Toolbar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutConfirm}
        onClose={handleLogoutCancel}
        PaperProps={{
          sx: {
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 2,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: 'hsl(var(--foreground))',
            fontWeight: 700,
            borderBottom: '1px solid hsl(var(--border))',
          }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: 'hsl(var(--foreground))' }}>
            Are you sure you want to logout from the admin panel?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleLogoutCancel}
            sx={{
              color: 'hsl(var(--foreground))',
              borderColor: 'hsl(var(--border))',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'hsl(0, 0%, 15%)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            sx={{
              backgroundColor: 'hsl(var(--netflix-red))',
              color: 'hsl(var(--foreground))',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'hsl(var(--netflix-red-hover))',
              },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;
