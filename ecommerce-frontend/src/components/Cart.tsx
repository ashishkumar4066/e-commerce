import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  TextField,
} from '@mui/material';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { checkCouponIsValid, placeOrder } from '@/service/api';

interface CartProps {
  open: boolean;
  onClose: () => void;
}

const Cart = ({ open, onClose }: CartProps) => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState('');
  const [isCouponValid, setIsCouponValid] = useState<boolean | null>(null);
  const subtotal = getCartTotal();
  const total = subtotal - appliedDiscount;

  const applyDiscountCode = async () => {
    const code = discountCode.trim().toUpperCase();
    if (code === '') {
      setDiscountMessage('Please enter a discount code');
      return;
    }
    const payload = { discountCode: code };
    const isCouponValid = await checkCouponIsValid(payload);
    setIsCouponValid(isCouponValid.suceess);
    console.log('Coupon validity:', isCouponValid);
    if (isCouponValid.suceess) {
      const discountAmount = subtotal * 0.1;
      setAppliedDiscount(discountAmount);
      setDiscountMessage(`Discount code "${code}" applied!`);
    } else {
      setAppliedDiscount(0);
      setDiscountMessage('Invalid discount code');
    }
  };

  const removeDiscountCode = () => {
    setDiscountCode('');
    setAppliedDiscount(0);
    setDiscountMessage('');
  };

  const proceedToCheckout = async () => {
    // Calculate total items (sum of all quantities)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Format items array
    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    // Create the payload
    const payload = {
      userId: user?.username || 'guest',
      items: items,
      totalItems: totalItems,
      totalAmount: total,
      discountCode: isCouponValid ? discountCode : '',
    };

    console.log('Checkout Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await placeOrder(payload);
      console.log('Order Response:', response);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Order failed:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          backgroundColor: 'hsl(var(--background))',
          borderLeft: '1px solid hsl(var(--border))',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid hsl(var(--border))',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
            }}
          >
            Your Cart
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'hsl(var(--foreground))',
              '&:hover': {
                color: 'hsl(var(--netflix-red))',
              },
            }}
          >
            <X size={24} />
          </IconButton>
        </Box>

        {/* Cart Items */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {cart.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
              }}
            >
              <ShoppingBag size={80} color="hsl(var(--muted-foreground))" />
              <Typography
                variant="h6"
                sx={{
                  color: 'hsl(var(--muted-foreground))',
                  textAlign: 'center',
                }}
              >
                Your cart is empty
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'hsl(var(--muted-foreground))',
                  textAlign: 'center',
                }}
              >
                Add some items to get started
              </Typography>
            </Box>
          ) : (
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mb: 3,
                      p: 2,
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: 2,
                      border: '1px solid hsl(var(--border))',
                    }}
                  >
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: 'hsl(var(--foreground))',
                          mb: 0.5,
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'hsl(var(--netflix-red))',
                          fontWeight: 700,
                          mb: 1,
                        }}
                      >
                        ₹ {item.price.toFixed(2)}
                      </Typography>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          sx={{
                            backgroundColor: 'hsl(var(--muted))',
                            color: 'hsl(var(--foreground))',
                            '&:hover': {
                              backgroundColor: 'hsl(var(--netflix-red))',
                            },
                          }}
                        >
                          <Minus size={16} />
                        </IconButton>
                        <Typography
                          sx={{
                            minWidth: 30,
                            textAlign: 'center',
                            fontWeight: 600,
                            color: 'hsl(var(--foreground))',
                          }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          sx={{
                            backgroundColor: 'hsl(var(--muted))',
                            color: 'hsl(var(--foreground))',
                            '&:hover': {
                              backgroundColor: 'hsl(var(--netflix-red))',
                            },
                          }}
                        >
                          <Plus size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          sx={{
                            ml: 'auto',
                            color: 'hsl(var(--muted-foreground))',
                            '&:hover': {
                              color: 'hsl(var(--destructive))',
                            },
                          }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </Box>

        {/* Summary */}
        {cart.length > 0 && (
          <Box
            sx={{
              p: 3,
              borderTop: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--card))',
            }}
          >
            <Box sx={{ mb: 2 }}>
              {/* Discount Code Input */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'hsl(var(--foreground))',
                    mb: 1,
                    fontWeight: 600,
                  }}
                >
                  Have a discount code?
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) =>
                      setDiscountCode(e.target.value.toUpperCase())
                    }
                    disabled={appliedDiscount > 0}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'hsl(var(--input))',
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
                        '&.Mui-disabled': {
                          backgroundColor: 'hsl(var(--muted))',
                        },
                      },
                      '& input::placeholder': {
                        color: 'hsl(var(--muted-foreground))',
                        opacity: 0.7,
                      },
                    }}
                  />
                  {appliedDiscount > 0 ? (
                    <Button
                      onClick={removeDiscountCode}
                      variant="outlined"
                      sx={{
                        color: 'hsl(var(--muted-foreground))',
                        borderColor: 'hsl(var(--border))',
                        textTransform: 'none',
                        minWidth: '80px',
                        '&:hover': {
                          borderColor: 'hsl(var(--destructive))',
                          color: 'hsl(var(--destructive))',
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      onClick={applyDiscountCode}
                      variant="contained"
                      sx={{
                        backgroundColor: 'hsl(var(--netflix-red))',
                        color: 'hsl(var(--foreground))',
                        textTransform: 'none',
                        minWidth: '80px',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--netflix-red-hover))',
                        },
                      }}
                    >
                      Apply
                    </Button>
                  )}
                </Box>
                {discountMessage && (
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        appliedDiscount > 0
                          ? 'hsl(120, 100%, 40%)'
                          : 'hsl(var(--destructive))',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Tag size={14} />
                    {discountMessage}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2, borderColor: 'hsl(var(--border))' }} />

              {/* Subtotal */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
                  Subtotal
                </Typography>
                <Typography sx={{ color: 'hsl(var(--foreground))' }}>
                  ₹ {subtotal.toFixed(2)}
                </Typography>
              </Box>

              {/* Discount */}
              {appliedDiscount > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
                    Discount
                  </Typography>
                  <Typography sx={{ color: 'hsl(var(--netflix-red))' }}>
                    - ₹ {appliedDiscount.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2, borderColor: 'hsl(var(--border))' }} />

              {/* Total */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: 'hsl(var(--foreground))', fontWeight: 700 }}
                >
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: 'hsl(var(--netflix-red))', fontWeight: 700 }}
                >
                  ₹ {total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={proceedToCheckout}
              fullWidth
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'hsl(var(--netflix-red))',
                color: 'hsl(var(--foreground))',
                fontWeight: 700,
                fontSize: '1.1rem',
                py: 1.5,
                textTransform: 'none',
                boxShadow: '0 0 30px hsl(var(--netflix-red-glow) / 0.5)',
                '&:hover': {
                  backgroundColor: 'hsl(var(--netflix-red-hover))',
                  boxShadow: '0 0 40px hsl(var(--netflix-red-glow) / 0.7)',
                },
              }}
            >
              Checkout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Cart;
