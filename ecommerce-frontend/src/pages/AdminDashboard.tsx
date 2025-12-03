import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Alert,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  LogOut,
  TrendingUp,
  Search,
  Warehouse,
} from 'lucide-react';
import { generateDiscount, fetchAllOrder, getProducts } from '@/service/api';
type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface Order {
  _id: string;
  orderNumber: number;
  userId: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
    _id: string;
  }[];
  totalItems: number;
  totalAmount: number;
  discountCode: string;
  discountAmount: number;
  finalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  productId: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  stock: number;
  createdAt: string;
  updatedAt: string;
}

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

const AdminDashboard = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [orderSearchResult, setOrderSearchResult] = useState<string>('');
  const [orderSearchType, setOrderSearchType] = useState<
    'success' | 'error' | ''
  >('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState('');
  const [totalInventory, setTotalInventory] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [productFilter, setProductFilter] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    } else {
      loadData();
    }
  }, [isAdmin, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load orders
      const ordersResponse = await fetchAllOrder();
      console.log('Fetched orders:', ordersResponse);
      if (ordersResponse && Array.isArray(ordersResponse)) {
        setOrders(ordersResponse);
      }

      // Load products to calculate total inventory
      const productsResponse = await getProducts();
      console.log('Fetched products:', productsResponse);
      if (productsResponse && Array.isArray(productsResponse)) {
        setProducts(productsResponse);
        const totalStock = productsResponse.reduce(
          (sum: number, product: any) => sum + (product.stock || 0),
          0
        );
        setTotalInventory(totalStock);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from orders
  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.finalAmount,
      0
    );
    const totalItems = orders.reduce((sum, order) => sum + order.totalItems, 0);
    const uniqueUsers = new Set(orders.map((order) => order.userId)).size;

    return [
      {
        title: 'Total Orders',
        value: totalOrders.toString(),
        icon: ShoppingBag,
        color: 'hsl(var(--netflix-red))',
        trend: '+12.5%',
      },
      {
        title: 'Total Users',
        value: uniqueUsers.toString(),
        icon: Users,
        color: 'hsl(120, 100%, 40%)',
        trend: '+8.2%',
      },
      {
        title: 'Revenue',
        value: `₹${totalRevenue.toFixed(2)}`,
        icon: DollarSign,
        color: 'hsl(45, 100%, 50%)',
        trend: '+15.3%',
      },
      {
        title: 'Inventory Items',
        value: totalInventory.toString(),
        icon: Warehouse,
        color: 'hsl(280, 100%, 60%)',
        trend: 'In Stock',
      },
      {
        title: 'Total Items Sold',
        value: totalItems.toString(),
        icon: Package,
        color: 'hsl(200, 100%, 50%)',
        trend: '+5',
      },
    ];
  };

  const stats = calculateStats();

  // Filter orders based on userId
  const filteredOrders = orders.filter((order) =>
    order.userId.toLowerCase().includes(userIdFilter.toLowerCase().trim())
  );

  // Filter products based on title or category
  const filteredProducts = products.filter(
    (product) =>
      product.title
        .toLowerCase()
        .includes(productFilter.toLowerCase().trim()) ||
      product.category
        .toLowerCase()
        .includes(productFilter.toLowerCase().trim())
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOrderSearch = async () => {
    if (!orderNumber.trim()) {
      setOrderSearchType('error');
      setOrderSearchResult('Please enter an order number');
      return;
    }

    // Validate that orderNumber is a positive integer
    const orderNum = parseInt(orderNumber.trim(), 10);
    if (isNaN(orderNum) || orderNum <= 0 || !Number.isInteger(orderNum)) {
      setOrderSearchType('error');
      setOrderSearchResult('Order number must be a positive integer');
      return;
    }

    const generatedDiscount = await generateDiscount({
      orderNumber: orderNum,
    });
    console.log('Generated Discount:', generatedDiscount);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'hsl(var(--background))',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            backgroundColor: 'hsl(var(--card))',
            borderBottom: '1px solid hsl(var(--border))',
            py: 2,
            px: 3,
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'hsl(var(--netflix-red))',
                  letterSpacing: '-0.5px',
                }}
              >
                ADMIN DASHBOARD
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Tooltip title="View Store" arrow>
                  <Button
                    onClick={() => navigate('/')}
                    sx={{
                      color: 'hsl(var(--foreground))',
                      textTransform: 'none',
                    }}
                  >
                    View Store
                  </Button>
                </Tooltip>
                <Tooltip title="Logout" arrow>
                  <IconButton
                    onClick={handleLogout}
                    sx={{
                      color: 'hsl(var(--foreground))',
                      '&:hover': {
                        color: 'hsl(var(--netflix-red))',
                      },
                    }}
                  >
                    <LogOut size={24} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Order Verification Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              sx={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                mb: 4,
              }}
            >
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    mb: orderSearchResult ? 2 : 0,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: 'hsl(var(--foreground))',
                      minWidth: 'fit-content',
                    }}
                  >
                    Generate Discount for Order:
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Enter Order Number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    sx={{
                      flex: 1,
                      maxWidth: 300,
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
                      },
                    }}
                  />
                  <Tooltip
                    title="Search and verify order by order number"
                    arrow
                  >
                    <Button
                      onClick={handleOrderSearch}
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: 'hsl(var(--netflix-red))',
                        color: 'hsl(var(--foreground))',
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        minWidth: 'fit-content',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--netflix-red-hover))',
                        },
                      }}
                    >
                      Generate Discount
                    </Button>
                  </Tooltip>
                </Box>
                {orderSearchResult && (
                  <Alert
                    severity={orderSearchType as AlertSeverity}
                    sx={{
                      py: 0.5,
                      backgroundColor:
                        orderSearchType === 'success'
                          ? 'hsl(120, 100%, 40% / 0.1)'
                          : 'hsl(0 84.2% 60.2% / 0.1)',
                      color: 'hsl(var(--foreground))',
                      border:
                        orderSearchType === 'success'
                          ? '1px solid hsl(120, 100%, 40% / 0.3)'
                          : '1px solid hsl(0 84.2% 60.2% / 0.3)',
                    }}
                  >
                    {orderSearchResult}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid - Fixed Grid2 issue */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ color: 'hsl(var(--muted-foreground))' }}
                          >
                            {stat.title}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: 'hsl(var(--foreground))',
                              mt: 1,
                            }}
                          >
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            backgroundColor: `${stat.color}20`,
                            p: 1.5,
                            borderRadius: 2,
                          }}
                        >
                          <stat.icon size={24} color={stat.color} />
                        </Box>
                      </Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <TrendingUp size={16} color="hsl(120, 100%, 40%)" />
                        <Typography
                          variant="caption"
                          sx={{ color: 'hsl(120, 100%, 40%)' }}
                        >
                          {stat.trend} from last month
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Orders and Inventory Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card
              sx={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <CardContent>
                {/* Tabs */}
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: 'hsl(var(--border))',
                    mb: 3,
                  }}
                >
                  <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    sx={{
                      '& .MuiTabs-indicator': {
                        backgroundColor: 'hsl(var(--netflix-red))',
                      },
                      '& .MuiTab-root': {
                        color: 'hsl(var(--muted-foreground))',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        '&.Mui-selected': {
                          color: 'hsl(var(--netflix-red))',
                        },
                      },
                    }}
                  >
                    <Tab label="Recent Orders" />
                    <Tab label="Inventory Details" />
                  </Tabs>
                </Box>

                {/* Tab Content */}
                {currentTab === 0 ? (
                  <>
                    {/* Orders Filter */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mb: 3,
                      }}
                    >
                      <Tooltip title="Filter orders by User ID" arrow>
                        <TextField
                          size="small"
                          placeholder="Search by User ID"
                          value={userIdFilter}
                          onChange={(e) => setUserIdFilter(e.target.value)}
                          sx={{
                            minWidth: 250,
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
                            },
                            '& input::placeholder': {
                              color: 'hsl(var(--muted-foreground))',
                              opacity: 0.7,
                            },
                          }}
                        />
                      </Tooltip>
                    </Box>
                    <TableContainer
                      component={Paper}
                      sx={{ backgroundColor: 'transparent' }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Order #
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              User ID
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Items
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Total Amount
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Discount
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Final Amount
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Date
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                sx={{
                                  textAlign: 'center',
                                  color: 'hsl(var(--muted-foreground))',
                                  py: 4,
                                }}
                              >
                                Loading orders...
                              </TableCell>
                            </TableRow>
                          ) : filteredOrders.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                sx={{
                                  textAlign: 'center',
                                  color: 'hsl(var(--muted-foreground))',
                                  py: 4,
                                }}
                              >
                                {orders.length === 0
                                  ? 'No orders found'
                                  : 'No orders match the filter'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredOrders.map((order) => (
                              <TableRow key={order._id}>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                    fontWeight: 600,
                                  }}
                                >
                                  {order.orderNumber}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  {order.userId}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  {order.totalItems}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  ₹{order.totalAmount.toFixed(2)}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color:
                                      order.discountAmount > 0
                                        ? 'hsl(120, 100%, 40%)'
                                        : 'hsl(var(--muted-foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  {order.discountAmount > 0 ? (
                                    <>
                                      ₹{order.discountAmount.toFixed(2)}
                                      {order.discountCode && (
                                        <Typography
                                          variant="caption"
                                          display="block"
                                          sx={{
                                            color:
                                              'hsl(var(--muted-foreground))',
                                          }}
                                        >
                                          ({order.discountCode})
                                        </Typography>
                                      )}
                                    </>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--netflix-red))',
                                    fontWeight: 700,
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  ₹{order.finalAmount.toFixed(2)}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--muted-foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  {new Date(order.createdAt).toLocaleDateString(
                                    'en-IN',
                                    {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    }
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <>
                    {/* Products Filter */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mb: 3,
                      }}
                    >
                      <Tooltip
                        title="Filter products by title or category"
                        arrow
                      >
                        <TextField
                          size="small"
                          placeholder="Search by Title or Category"
                          value={productFilter}
                          onChange={(e) => setProductFilter(e.target.value)}
                          sx={{
                            minWidth: 250,
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
                            },
                            '& input::placeholder': {
                              color: 'hsl(var(--muted-foreground))',
                              opacity: 0.7,
                            },
                          }}
                        />
                      </Tooltip>
                    </Box>

                    {/* Products Table */}
                    <TableContainer
                      component={Paper}
                      sx={{ backgroundColor: 'transparent' }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Product ID
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Title
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Category
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Price
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Stock
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Rating
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                fontWeight: 600,
                                borderBottom: '1px solid hsl(var(--border))',
                              }}
                            >
                              Last Updated
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                sx={{
                                  textAlign: 'center',
                                  color: 'hsl(var(--muted-foreground))',
                                  py: 4,
                                }}
                              >
                                Loading products...
                              </TableCell>
                            </TableRow>
                          ) : filteredProducts.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                sx={{
                                  textAlign: 'center',
                                  color: 'hsl(var(--muted-foreground))',
                                  py: 4,
                                }}
                              >
                                {products.length === 0
                                  ? 'No products found'
                                  : 'No products match the filter'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredProducts.map((product) => (
                              <TableRow key={product._id}>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                    fontWeight: 600,
                                  }}
                                >
                                  {product.productId}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  {product.title}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  {product.category}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  ₹{product.price.toFixed(2)}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color:
                                      product.stock > 10
                                        ? 'hsl(120, 100%, 40%)'
                                        : product.stock > 0
                                        ? 'hsl(45, 100%, 50%)'
                                        : 'hsl(var(--netflix-red))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                    fontWeight: 600,
                                  }}
                                >
                                  {product.stock}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  ⭐ {product.rating.rate.toFixed(1)} (
                                  {product.rating.count})
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: 'hsl(var(--muted-foreground))',
                                    borderBottom:
                                      '1px solid hsl(var(--border))',
                                  }}
                                >
                                  {new Date(
                                    product.updatedAt
                                  ).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
