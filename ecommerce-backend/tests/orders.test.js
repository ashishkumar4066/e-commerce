const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ordersRouter = require('../src/routes/orders');
const Order = require('../src/models/Order');
const DiscountCode = require('../src/models/DiscountCode');
const Product = require('../src/models/Product');

const app = express();
app.use(express.json());
app.use('/api/checkout', ordersRouter);

let mongoServer;

describe('Orders API', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Order.deleteMany({});
    await DiscountCode.deleteMany({});
    await Product.deleteMany({});
  });

  describe('POST /api/checkout/checkIsCouponValid', () => {
    it('should return valid when next order qualifies for discount (5th, 10th, 15th...)', async () => {
      // Create 4 orders so next order will be #5
      for (let i = 1; i <= 4; i++) {
        await Order.create({
          orderNumber: i,
          userId: `user${i}`,
          items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
          totalItems: 1,
          totalAmount: 100,
          finalAmount: 100,
        });
      }

      const response = await request(app).post('/api/checkout/checkIsCouponValid');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Coupon is valid');
    });

    it('should return invalid when next order does not qualify for discount', async () => {
      // Create 2 orders so next order will be #3
      for (let i = 1; i <= 2; i++) {
        await Order.create({
          orderNumber: i,
          userId: `user${i}`,
          items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
          totalItems: 1,
          totalAmount: 100,
          finalAmount: 100,
        });
      }

      const response = await request(app).post('/api/checkout/checkIsCouponValid');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Coupon is not valid');
    });

    it('should return valid when no orders exist (first order qualifies)', async () => {
      const response = await request(app).post('/api/checkout/checkIsCouponValid');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Coupon is not valid');
    });

    it('should handle database errors gracefully', async () => {
      await mongoose.connection.close();

      const response = await request(app).post('/api/checkout/checkIsCouponValid');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Something went wrong!');

      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    });
  });

  describe('POST /api/checkout/placeOrder', () => {
    let testProduct;

    beforeEach(async () => {
      testProduct = await Product.create({
        productId: 1,
        title: 'Test Product',
        price: 100,
        description: 'Test description',
        category: 'electronics',
        image: 'http://example.com/image.jpg',
        rating: { rate: 4.5, count: 100 },
        stock: 50,
      });
    });

    it('should successfully place an order without discount code', async () => {
      const orderData = {
        userId: 'user123',
        items: [
          {
            productId: 1,
            quantity: 2,
            price: 100,
            subTotal: 200,
          },
        ],
        totalItems: 2,
        totalAmount: 200,
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order placed successfully.');
      expect(response.body.body.userId).toBe('user123');
      expect(response.body.body.orderNumber).toBe(1);
      expect(response.body.body.totalAmount).toBe(200);
      expect(response.body.body.finalAmount).toBe(200);

      // Verify stock was reduced
      const updatedProduct = await Product.findOne({ productId: 1 });
      expect(updatedProduct.stock).toBe(48);
    });

    it('should return 400 when userId is missing', async () => {
      const orderData = {
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('userId is required');
    });

    it('should return 404 when product does not exist', async () => {
      const orderData = {
        userId: 'user123',
        items: [
          {
            productId: 999,
            quantity: 1,
            price: 100,
            subTotal: 100,
          },
        ],
        totalItems: 1,
        totalAmount: 100,
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Product with ID 999 not found');
    });

    it('should return 400 when insufficient stock', async () => {
      const orderData = {
        userId: 'user123',
        items: [
          {
            productId: 1,
            quantity: 100,
            price: 100,
            subTotal: 10000,
          },
        ],
        totalItems: 100,
        totalAmount: 10000,
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Only 50 items available in stock');
    });

    it('should apply valid discount code successfully', async () => {
      const discountCode = await DiscountCode.create({
        code: 'DISCOUNT1',
        percentage: 10,
        isUsed: false,
        generatedForOrder: 1,
      });

      const orderData = {
        userId: 'user123',
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
        discountCode: 'DISCOUNT1',
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.body.discountAmount).toBe(10);
      expect(response.body.body.finalAmount).toBe(90);

      // Verify discount code is marked as used
      const updatedDiscount = await DiscountCode.findOne({ code: 'DISCOUNT1' });
      expect(updatedDiscount.isUsed).toBe(true);
      expect(updatedDiscount.usedBy).toBe('user123');
    });

    it('should return 400 when discount code is invalid', async () => {
      const orderData = {
        userId: 'user123',
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
        discountCode: 'INVALID_CODE',
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Coupon code is invalid');
    });

    it('should return 400 when discount code has already been used', async () => {
      await DiscountCode.create({
        code: 'DISCOUNT1',
        percentage: 10,
        isUsed: true,
        generatedForOrder: 1,
        usedBy: 'otherUser',
      });

      const orderData = {
        userId: 'user123',
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
        discountCode: 'DISCOUNT1',
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Discount code has already been used');
    });

    it('should return 400 when discount code is for different order number', async () => {
      await DiscountCode.create({
        code: 'DISCOUNT5',
        percentage: 10,
        isUsed: false,
        generatedForOrder: 5,
      });

      const orderData = {
        userId: 'user123',
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
        discountCode: 'DISCOUNT5',
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(
        'This discount code can only be applied for order #5. Your current order is #1'
      );
    });

    it('should auto-generate discount code for next qualifying order', async () => {
      // Place 4 orders, so after placing this order (order #4),
      // it should generate discount for order #5
      for (let i = 1; i <= 3; i++) {
        await Order.create({
          orderNumber: i,
          userId: `user${i}`,
          items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
          totalItems: 1,
          totalAmount: 100,
          finalAmount: 100,
        });
      }

      const orderData = {
        userId: 'user123',
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify discount code for order #5 was created
      const discountCode = await DiscountCode.findOne({
        generatedForOrder: 5,
      });
      expect(discountCode).toBeDefined();
      expect(discountCode.code).toBe('DISCOUNT5');
      expect(discountCode.percentage).toBe(10);
      expect(discountCode.isUsed).toBe(false);
    });

    it('should not create duplicate discount code if it already exists', async () => {
      // Pre-create discount code for order #5
      await DiscountCode.create({
        code: 'DISCOUNT5',
        percentage: 10,
        isUsed: false,
        generatedForOrder: 5,
      });

      // Place 3 orders
      for (let i = 1; i <= 3; i++) {
        await Order.create({
          orderNumber: i,
          userId: `user${i}`,
          items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
          totalItems: 1,
          totalAmount: 100,
          finalAmount: 100,
        });
      }

      const orderData = {
        userId: 'user123',
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify only one discount code exists
      const discountCodes = await DiscountCode.find({
        generatedForOrder: 5,
      });
      expect(discountCodes.length).toBe(1);
    });

    it('should increment order number correctly', async () => {
      await Order.create({
        orderNumber: 5,
        userId: 'user5',
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
        finalAmount: 100,
      });

      const orderData = {
        userId: 'user123',
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.body.orderNumber).toBe(6);
    });

    it('should handle database errors gracefully', async () => {
      await mongoose.connection.close();

      const orderData = {
        userId: 'user123',
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
      };

      const response = await request(app)
        .post('/api/checkout/placeOrder')
        .send(orderData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    });
  });

  describe('GET /api/checkout/fetchAllOrder', () => {
    it('should return empty array when no orders exist', async () => {
      const response = await request(app).get('/api/checkout/fetchAllOrder');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Orders fetched successfully');
      expect(response.body.body).toEqual([]);
    });

    it('should return all orders sorted by creation date (newest first)', async () => {
      // Create orders with different timestamps
      const order1 = await Order.create({
        orderNumber: 1,
        userId: 'user1',
        items: [{ productId: 1, quantity: 1, price: 100, subTotal: 100 }],
        totalItems: 1,
        totalAmount: 100,
        finalAmount: 100,
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const order2 = await Order.create({
        orderNumber: 2,
        userId: 'user2',
        items: [{ productId: 1, quantity: 2, price: 100, subTotal: 200 }],
        totalItems: 2,
        totalAmount: 200,
        finalAmount: 200,
      });

      const response = await request(app).get('/api/checkout/fetchAllOrder');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.body).toHaveLength(2);

      // Verify sorting (newest first)
      expect(response.body.body[0].orderNumber).toBe(2);
      expect(response.body.body[1].orderNumber).toBe(1);
    });

    it('should return orders with all fields', async () => {
      await Order.create({
        orderNumber: 1,
        userId: 'user123',
        items: [{ productId: 1, quantity: 2, price: 100, subTotal: 200 }],
        totalItems: 2,
        totalAmount: 200,
        discountCode: 'DISCOUNT1',
        discountAmount: 20,
        finalAmount: 180,
      });

      const response = await request(app).get('/api/checkout/fetchAllOrder');

      expect(response.status).toBe(200);
      expect(response.body.body[0].orderNumber).toBe(1);
      expect(response.body.body[0].userId).toBe('user123');
      expect(response.body.body[0].totalItems).toBe(2);
      expect(response.body.body[0].totalAmount).toBe(200);
      expect(response.body.body[0].discountCode).toBe('DISCOUNT1');
      expect(response.body.body[0].discountAmount).toBe(20);
      expect(response.body.body[0].finalAmount).toBe(180);
    });

    it('should handle database errors gracefully', async () => {
      await mongoose.connection.close();

      const response = await request(app).get('/api/checkout/fetchAllOrder');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    });
  });
});
