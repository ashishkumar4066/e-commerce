const axios = require('axios');
const Product = require('../models/Product');

// Fetching products from FakeStore API and seeding the database
const productListDatabase = async () => {
  try {
    const count = await Product.countDocuments();

    if (count > 0) {
      console.log('📦 Database already seeded with', count, 'products');
      return;
    }

    console.log('🌐 Fetching products from FakeStore API...');

    const response = await axios.get('https://fakestoreapi.com/products');
    const apiProducts = response.data;

    const products = apiProducts.map((product) => ({
      productId: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      stock: Math.floor(Math.random() * 50) + 10,
      category: product.category,
      image: product.image,
      rating: product.rating,
    }));

    await Product.insertMany(products);
    console.log(
      `✅ Database seeded with ${products.length} products from FakeStore API`
    );
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};

module.exports = productListDatabase;
