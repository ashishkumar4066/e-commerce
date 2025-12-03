const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const productsRouter = require('../src/routes/products');
const Product = require('../src/models/Product');

const app = express();
app.use(express.json());
app.use('/api/products', productsRouter);

let mongoServer;

describe('Products API', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up and close connections
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clear all products after each test
    await Product.deleteMany({});
  });

  describe('GET /api/products', () => {
    it('should return empty array when no products exist', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    it('should return all products when products exist', async () => {
      // Create test products
      const testProducts = [
        {
          productId: 1,
          title: 'Test Product 1',
          price: 99.99,
          description: 'Test description 1',
          category: 'electronics',
          image: 'http://example.com/image1.jpg',
          rating: { rate: 4.5, count: 100 },
          stock: 50,
        },
        {
          productId: 2,
          title: 'Test Product 2',
          price: 149.99,
          description: 'Test description 2',
          category: 'clothing',
          image: 'http://example.com/image2.jpg',
          rating: { rate: 4.0, count: 80 },
          stock: 30,
        },
      ];

      await Product.insertMany(testProducts);

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe('Test Product 1');
      expect(response.body.data[1].title).toBe('Test Product 2');
    });

    it('should handle database errors gracefully', async () => {
      // Force an error by closing the connection
      await mongoose.connection.close();

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      // Reconnect for other tests
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product when valid ID is provided', async () => {
      const testProduct = await Product.create({
        productId: 1,
        title: 'Test Product',
        price: 99.99,
        description: 'Test description',
        category: 'electronics',
        image: 'http://example.com/image.jpg',
        rating: { rate: 4.5, count: 100 },
        stock: 50,
      });

      const response = await request(app).get(
        `/api/products/${testProduct._id}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Test Product');
      expect(response.body.data.price).toBe(99.99);
    });

    it('should return 404 when product is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/products/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Product not found');
    });

    it('should return 500 when invalid ID format is provided', async () => {
      const response = await request(app).get('/api/products/invalid-id');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      const testProduct = await Product.create({
        productId: 1,
        title: 'Test Product',
        price: 99.99,
        description: 'Test description',
        category: 'electronics',
        image: 'http://example.com/image.jpg',
        rating: { rate: 4.5, count: 100 },
        stock: 50,
      });

      // Force an error by closing the connection
      await mongoose.connection.close();

      const response = await request(app).get(
        `/api/products/${testProduct._id}`
      );

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      // Reconnect for other tests
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    });
  });

  describe('Product Model Validation', () => {
    it('should validate required fields', async () => {
      const invalidProduct = new Product({
        // Missing required fields
        title: 'Test Product',
      });

      let error;
      try {
        await invalidProduct.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
    });

    it('should create product with all valid fields', async () => {
      const validProduct = await Product.create({
        productId: 1,
        title: 'Test Product',
        price: 99.99,
        description: 'Test description',
        category: 'electronics',
        image: 'http://example.com/image.jpg',
        rating: { rate: 4.5, count: 100 },
        stock: 50,
      });

      expect(validProduct._id).toBeDefined();
      expect(validProduct.productId).toBe(1);
      expect(validProduct.title).toBe('Test Product');
      expect(validProduct.stock).toBe(50);
    });
  });
});
