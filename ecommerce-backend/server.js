require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, disconnectDB } = require('./src/config/database');
const productListDatabase = require('./src/routes/productListDatabase');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const adminRoutes = require('./src/routes/admin');

app.use('/api/products', productRoutes);
app.use('/api/checkout', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Ecommerce API is running',
    endpoints: {
      allProducts: '/api/products',
      placeOrder: '/api/checkout/placeOrder',
      fetchAllOrder: '/api/checkout/fetchAllOrder',
      checkIsCouponValid: '/api/checkout/checkIsCouponValid',
      generateDiscount: '/api/admin/generate-discount',
    },
  });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Connect to in-memory MongoDB
    await connectDB();
    await productListDatabase();
    // Start Express server
    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📚 API Documentation:');
      console.log(`   Health Check:        http://localhost:${PORT}/`);
      console.log(`   All Products:        http://localhost:${PORT}/api/products`);
      console.log(`   Place Order:         http://localhost:${PORT}/api/checkout/placeOrder`);
      console.log(`   Fetch All Orders:    http://localhost:${PORT}/api/checkout/fetchAllOrder`);
      console.log(`   Check Coupon Valid:  http://localhost:${PORT}/api/checkout/checkIsCouponValid`);
      console.log(`   Generate Discount:   http://localhost:${PORT}/api/admin/generate-discount`);
      console.log('\n💡 Tip: Data is stored in memory and resets on restart\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
