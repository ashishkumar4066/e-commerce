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
const cartRoutes = require('./src/routes/carts');
const orderRoutes = require('./src/routes/orders');

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', orderRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Ecommerce API is running',
    endpoints: {
      products: '/api/products',
      cart: '/api/cart',
      checkout: '/api/checkout',
      admin: '/api/admin/stats',
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
      console.log(`   Health Check: http://localhost:${PORT}/`);
      console.log(`   Products:     http://localhost:${PORT}/api/products`);
      console.log(`   Cart:         http://localhost:${PORT}/api/cart/:userId`);
      console.log(`   Checkout:     http://localhost:${PORT}/api/checkout`);
      console.log(`   Admin Stats:  http://localhost:${PORT}/api/admin/stats`);
      console.log('\n💡 Tip: Data is stored in memory and resets on restart\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
