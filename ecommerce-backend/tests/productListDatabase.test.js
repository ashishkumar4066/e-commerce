const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const axios = require('axios');
const productListDatabase = require('../src/routes/productListDatabase');
const Product = require('../src/models/Product');

jest.mock('axios');

let mongoServer;

describe('Product List Database Seeding', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
    jest.clearAllMocks();
  });

  describe('Database Seeding Logic', () => {
    it('should fetch products from FakeStore API and seed database when empty', async () => {
      const mockApiProducts = [
        {
          id: 1,
          title: 'Product 1',
          price: 100,
          description: 'Description 1',
          category: 'electronics',
          image: 'http://example.com/1.jpg',
          rating: { rate: 4.5, count: 100 },
        },
        {
          id: 2,
          title: 'Product 2',
          price: 200,
          description: 'Description 2',
          category: 'clothing',
          image: 'http://example.com/2.jpg',
          rating: { rate: 4.0, count: 50 },
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiProducts });

      await productListDatabase();

      const products = await Product.find();
      expect(products.length).toBe(2);
      expect(products[0].productId).toBe(1);
      expect(products[0].title).toBe('Product 1');
      expect(products[0].price).toBe(100);
      expect(products[1].productId).toBe(2);
      expect(products[1].title).toBe('Product 2');
    });

    it('should not seed database if products already exist', async () => {
      // Pre-populate database
      await Product.create({
        productId: 1,
        title: 'Existing Product',
        price: 50,
        description: 'Existing description',
        category: 'test',
        image: 'http://example.com/existing.jpg',
        rating: { rate: 5.0, count: 1 },
        stock: 10,
      });

      await productListDatabase();

      // Verify axios was not called
      expect(axios.get).not.toHaveBeenCalled();

      // Verify only original product exists
      const products = await Product.find();
      expect(products.length).toBe(1);
      expect(products[0].title).toBe('Existing Product');
    });

    it('should add random stock to each product (between 10-60)', async () => {
      const mockApiProducts = [
        {
          id: 1,
          title: 'Product 1',
          price: 100,
          description: 'Description 1',
          category: 'electronics',
          image: 'http://example.com/1.jpg',
          rating: { rate: 4.5, count: 100 },
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiProducts });

      await productListDatabase();

      const products = await Product.find();
      expect(products[0].stock).toBeGreaterThanOrEqual(10);
      expect(products[0].stock).toBeLessThanOrEqual(60);
    });

    it('should preserve all product fields from API', async () => {
      const mockApiProduct = {
        id: 99,
        title: 'Test Product',
        price: 999.99,
        description: 'Test Description',
        category: 'test-category',
        image: 'http://example.com/test.jpg',
        rating: { rate: 3.5, count: 200 },
      };

      axios.get.mockResolvedValue({ data: [mockApiProduct] });

      await productListDatabase();

      const product = await Product.findOne({ productId: 99 });
      expect(product.productId).toBe(99);
      expect(product.title).toBe('Test Product');
      expect(product.price).toBe(999.99);
      expect(product.description).toBe('Test Description');
      expect(product.category).toBe('test-category');
      expect(product.image).toBe('http://example.com/test.jpg');
      expect(product.rating.rate).toBe(3.5);
      expect(product.rating.count).toBe(200);
    });

    it('should seed multiple products correctly', async () => {
      const mockApiProducts = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Product ${i + 1}`,
        price: (i + 1) * 10,
        description: `Description ${i + 1}`,
        category: 'category',
        image: `http://example.com/${i + 1}.jpg`,
        rating: { rate: 4.0, count: 10 },
      }));

      axios.get.mockResolvedValue({ data: mockApiProducts });

      await productListDatabase();

      const products = await Product.find();
      expect(products.length).toBe(20);

      // Verify all products are present
      for (let i = 0; i < 20; i++) {
        const product = products.find((p) => p.productId === i + 1);
        expect(product).toBeDefined();
        expect(product.title).toBe(`Product ${i + 1}`);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      // Should not throw
      await expect(productListDatabase()).resolves.not.toThrow();

      // Database should remain empty
      const products = await Product.find();
      expect(products.length).toBe(0);
    });

    it('should handle network timeout errors', async () => {
      axios.get.mockRejectedValue(new Error('ETIMEDOUT'));

      await productListDatabase();

      const products = await Product.find();
      expect(products.length).toBe(0);
    });

    it('should handle malformed API response', async () => {
      axios.get.mockResolvedValue({ data: null });

      // Should handle gracefully without throwing
      await expect(productListDatabase()).resolves.not.toThrow();

      // Database should remain empty
      const products = await Product.find();
      expect(products.length).toBe(0);
    });

    it('should handle database insertion errors', async () => {
      const mockApiProducts = [
        {
          id: 1,
          title: 'Product 1',
          price: 100,
          description: 'Description 1',
          category: 'electronics',
          image: 'http://example.com/1.jpg',
          rating: { rate: 4.5, count: 100 },
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiProducts });

      // Close database connection to cause error
      await mongoose.connection.close();

      await productListDatabase();

      // Reconnect for cleanup
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    });
  });

  describe('Data Transformation', () => {
    it('should map API product structure to database schema', async () => {
      const mockApiProduct = {
        id: 1,
        title: 'Test',
        price: 50,
        description: 'Desc',
        category: 'cat',
        image: 'img.jpg',
        rating: { rate: 4, count: 10 },
      };

      axios.get.mockResolvedValue({ data: [mockApiProduct] });

      await productListDatabase();

      const product = await Product.findOne({ productId: 1 });

      // Verify field mapping
      expect(product.productId).toBe(mockApiProduct.id);
      expect(product.title).toBe(mockApiProduct.title);
      expect(product.price).toBe(mockApiProduct.price);
      expect(product.description).toBe(mockApiProduct.description);
      expect(product.category).toBe(mockApiProduct.category);
      expect(product.image).toBe(mockApiProduct.image);
      expect(product.rating).toEqual(mockApiProduct.rating);
      expect(product.stock).toBeDefined();
    });

    it('should handle products with different categories', async () => {
      const mockApiProducts = [
        {
          id: 1,
          title: 'Product 1',
          price: 100,
          description: 'Desc',
          category: 'electronics',
          image: 'img.jpg',
          rating: { rate: 4, count: 10 },
        },
        {
          id: 2,
          title: 'Product 2',
          price: 200,
          description: 'Desc',
          category: 'clothing',
          image: 'img.jpg',
          rating: { rate: 4, count: 10 },
        },
        {
          id: 3,
          title: 'Product 3',
          price: 300,
          description: 'Desc',
          category: 'jewelery',
          image: 'img.jpg',
          rating: { rate: 4, count: 10 },
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiProducts });

      await productListDatabase();

      const products = await Product.find();
      const categories = products.map((p) => p.category);

      expect(categories).toContain('electronics');
      expect(categories).toContain('clothing');
      expect(categories).toContain('jewelery');
    });

    it('should handle products with decimal prices', async () => {
      const mockApiProduct = {
        id: 1,
        title: 'Product',
        price: 19.99,
        description: 'Desc',
        category: 'test',
        image: 'img.jpg',
        rating: { rate: 4.5, count: 10 },
      };

      axios.get.mockResolvedValue({ data: [mockApiProduct] });

      await productListDatabase();

      const product = await Product.findOne({ productId: 1 });
      expect(product.price).toBe(19.99);
    });

    it('should handle products with rating decimals', async () => {
      const mockApiProduct = {
        id: 1,
        title: 'Product',
        price: 100,
        description: 'Desc',
        category: 'test',
        image: 'img.jpg',
        rating: { rate: 4.7, count: 123 },
      };

      axios.get.mockResolvedValue({ data: [mockApiProduct] });

      await productListDatabase();

      const product = await Product.findOne({ productId: 1 });
      expect(product.rating.rate).toBe(4.7);
      expect(product.rating.count).toBe(123);
    });
  });

  describe('API Integration', () => {
    it('should call FakeStore API with correct URL', async () => {
      axios.get.mockResolvedValue({ data: [] });

      await productListDatabase();

      expect(axios.get).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products'
      );
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should not make API call if database is already seeded', async () => {
      await Product.create({
        productId: 1,
        title: 'Existing',
        price: 50,
        description: 'Desc',
        category: 'test',
        image: 'img.jpg',
        rating: { rate: 5, count: 1 },
        stock: 10,
      });

      await productListDatabase();

      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty API response', async () => {
      axios.get.mockResolvedValue({ data: [] });

      await productListDatabase();

      const products = await Product.find();
      expect(products.length).toBe(0);
    });

    it('should handle single product from API', async () => {
      const mockApiProduct = {
        id: 1,
        title: 'Single Product',
        price: 100,
        description: 'Description',
        category: 'electronics',
        image: 'http://example.com/1.jpg',
        rating: { rate: 4.5, count: 100 },
      };

      axios.get.mockResolvedValue({ data: [mockApiProduct] });

      await productListDatabase();

      const products = await Product.find();
      expect(products.length).toBe(1);
    });

    it('should handle very large product count from API', async () => {
      const mockApiProducts = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Product ${i + 1}`,
        price: 100,
        description: 'Description',
        category: 'test',
        image: 'http://example.com/img.jpg',
        rating: { rate: 4.0, count: 10 },
      }));

      axios.get.mockResolvedValue({ data: mockApiProducts });

      await productListDatabase();

      const products = await Product.find();
      expect(products.length).toBe(100);
    });

    it('should handle products with long titles and descriptions', async () => {
      const longTitle = 'A'.repeat(500);
      const longDescription = 'B'.repeat(1000);

      const mockApiProduct = {
        id: 1,
        title: longTitle,
        price: 100,
        description: longDescription,
        category: 'test',
        image: 'http://example.com/img.jpg',
        rating: { rate: 4.0, count: 10 },
      };

      axios.get.mockResolvedValue({ data: [mockApiProduct] });

      await productListDatabase();

      const product = await Product.findOne({ productId: 1 });
      expect(product.title).toBe(longTitle);
      expect(product.description).toBe(longDescription);
    });

    it('should handle products with special characters in title', async () => {
      const mockApiProduct = {
        id: 1,
        title: 'Product with "quotes" & <special> characters!',
        price: 100,
        description: 'Description',
        category: 'test',
        image: 'http://example.com/img.jpg',
        rating: { rate: 4.0, count: 10 },
      };

      axios.get.mockResolvedValue({ data: [mockApiProduct] });

      await productListDatabase();

      const product = await Product.findOne({ productId: 1 });
      expect(product.title).toBe(
        'Product with "quotes" & <special> characters!'
      );
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent - calling multiple times should not duplicate data', async () => {
      const mockApiProducts = [
        {
          id: 1,
          title: 'Product 1',
          price: 100,
          description: 'Description',
          category: 'test',
          image: 'http://example.com/1.jpg',
          rating: { rate: 4.0, count: 10 },
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiProducts });

      // Call multiple times
      await productListDatabase();
      await productListDatabase();
      await productListDatabase();

      // Should still have only 1 product
      const products = await Product.find();
      expect(products.length).toBe(1);
    });

    it('should check database count before seeding each time', async () => {
      const mockApiProducts = [
        {
          id: 1,
          title: 'Product 1',
          price: 100,
          description: 'Description',
          category: 'test',
          image: 'http://example.com/1.jpg',
          rating: { rate: 4.0, count: 10 },
        },
      ];

      axios.get.mockResolvedValue({ data: mockApiProducts });

      await productListDatabase();

      // Clear mock to verify it's not called again
      jest.clearAllMocks();

      await productListDatabase();

      // axios.get should not be called the second time
      expect(axios.get).not.toHaveBeenCalled();
    });
  });
});
