const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const adminRouter = require('../src/routes/admin');
const DiscountCode = require('../src/models/DiscountCode');
const Order = require('../src/models/Order');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRouter);

let mongoServer;

describe('Admin API', () => {
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
    await DiscountCode.deleteMany({});
    await Order.deleteMany({});
  });

  describe('POST /api/admin/generate-discount', () => {
    describe('Validation Tests', () => {
      it('should return 400 when orderNumber is missing', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('orderNumber is required');
      });

      it('should return 400 when orderNumber is not an integer', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5.5 });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
          'orderNumber must be a positive integer'
        );
      });

      it('should return 400 when orderNumber is zero', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 0 });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        // Note: 0 is falsy in JavaScript, so it triggers the "orderNumber is required" check
        expect(response.body.message).toBe('orderNumber is required');
      });

      it('should return 400 when orderNumber is negative', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: -5 });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
          'orderNumber must be a positive integer'
        );
      });

      it('should return 400 when orderNumber is a string', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 'invalid' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
          'orderNumber must be a positive integer'
        );
      });
    });

    describe('Qualifying Order Tests', () => {
      it('should return 400 when order number does not qualify (order #1)', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 1 });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain(
          "Order #1 doesn't qualify for discount"
        );
        expect(response.body.message).toContain('Only orders 5, 10, 15');
        expect(response.body.qualifyingOrders).toBe('Next qualifying order: #5');
      });

      it('should return 400 when order number does not qualify (order #3)', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 3 });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain(
          "Order #3 doesn't qualify for discount"
        );
        expect(response.body.qualifyingOrders).toBe('Next qualifying order: #5');
      });

      it('should return 400 when order number does not qualify (order #7)', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 7 });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.qualifyingOrders).toBe(
          'Next qualifying order: #10'
        );
      });

      it('should accept qualifying order number 5', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      it('should accept qualifying order number 10', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 10 });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      it('should accept qualifying order number 15', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 15 });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      it('should accept qualifying order number 100', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 100 });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    describe('Successful Discount Generation', () => {
      it('should successfully generate discount code for order #5', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
          'Discount code generated successfully for order #5'
        );
        expect(response.body.discountCode).toBeDefined();
        expect(response.body.discountCode.code).toBe('DISCOUNT5');
        expect(response.body.discountCode.percentage).toBe(10);
        expect(response.body.discountCode.generatedForOrder).toBe(5);
        expect(response.body.discountCode.isUsed).toBe(false);
        expect(response.body.discountCode.createdAt).toBeDefined();
      });

      it('should create discount code in database', async () => {
        await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 10 });

        const discountCode = await DiscountCode.findOne({
          generatedForOrder: 10,
        });

        expect(discountCode).toBeDefined();
        expect(discountCode.code).toBe('DISCOUNT10');
        expect(discountCode.percentage).toBe(10);
        expect(discountCode.isUsed).toBe(false);
        expect(discountCode.usedBy).toBeNull();
      });

      it('should generate unique codes for different order numbers', async () => {
        await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 10 });

        const code5 = await DiscountCode.findOne({ generatedForOrder: 5 });
        const code10 = await DiscountCode.findOne({ generatedForOrder: 10 });

        expect(code5.code).toBe('DISCOUNT5');
        expect(code10.code).toBe('DISCOUNT10');
        expect(code5.code).not.toBe(code10.code);
      });
    });

    describe('Existing Discount Code Tests', () => {
      it('should return 200 when discount code already exists and is unused', async () => {
        // Pre-create a discount code
        await DiscountCode.create({
          code: 'DISCOUNT5',
          percentage: 10,
          isUsed: false,
          generatedForOrder: 5,
        });

        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe(
          'Discount Code already exists but not used'
        );
      });

      it('should return 200 when discount code already exists and has been used', async () => {
        // Pre-create a used discount code
        await DiscountCode.create({
          code: 'DISCOUNT10',
          percentage: 10,
          isUsed: true,
          generatedForOrder: 10,
          usedBy: 'user123',
        });

        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 10 });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe(
          'Discount code already exists and has been used'
        );
      });

      it('should not create duplicate discount code when one already exists', async () => {
        // Create first discount code
        await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        // Try to create again
        await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        // Verify only one discount code exists
        const discountCodes = await DiscountCode.find({
          generatedForOrder: 5,
        });
        expect(discountCodes.length).toBe(1);
      });
    });

    describe('Error Handling', () => {
      it('should handle database errors gracefully', async () => {
        await mongoose.connection.close();

        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Internal server error');
        expect(response.body.error).toBeDefined();

        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
      });

      it('should handle unexpected input types', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: null });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should handle array input', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: [5] });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should handle object input', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: { value: 5 } });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle very large qualifying order numbers', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 10000 });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.discountCode.code).toBe('DISCOUNT10000');
      });

      it('should calculate next qualifying order correctly for order #1', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 1 });

        expect(response.body.qualifyingOrders).toBe('Next qualifying order: #5');
      });

      it('should calculate next qualifying order correctly for order #6', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 6 });

        expect(response.body.qualifyingOrders).toBe(
          'Next qualifying order: #10'
        );
      });

      it('should calculate next qualifying order correctly for order #11', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 11 });

        expect(response.body.qualifyingOrders).toBe(
          'Next qualifying order: #15'
        );
      });
    });

    describe('Business Logic Validation', () => {
      it('should generate discount with exactly 10% percentage', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        expect(response.body.discountCode.percentage).toBe(10);

        const savedCode = await DiscountCode.findOne({ generatedForOrder: 5 });
        expect(savedCode.percentage).toBe(10);
      });

      it('should set isUsed to false initially', async () => {
        const response = await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        expect(response.body.discountCode.isUsed).toBe(false);

        const savedCode = await DiscountCode.findOne({ generatedForOrder: 5 });
        expect(savedCode.isUsed).toBe(false);
      });

      it('should set usedBy to null initially', async () => {
        await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        const savedCode = await DiscountCode.findOne({ generatedForOrder: 5 });
        expect(savedCode.usedBy).toBeNull();
      });

      it('should follow naming convention DISCOUNT{orderNumber}', async () => {
        const testCases = [5, 10, 20, 50, 100];

        for (const orderNum of testCases) {
          await request(app)
            .post('/api/admin/generate-discount')
            .send({ orderNumber: orderNum });

          const savedCode = await DiscountCode.findOne({
            generatedForOrder: orderNum,
          });
          expect(savedCode.code).toBe(`DISCOUNT${orderNum}`);
        }
      });

      it('should store createdAt timestamp', async () => {
        const beforeTime = new Date();

        await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        const afterTime = new Date();
        const savedCode = await DiscountCode.findOne({ generatedForOrder: 5 });

        expect(savedCode.createdAt).toBeDefined();
        expect(new Date(savedCode.createdAt).getTime()).toBeGreaterThanOrEqual(
          beforeTime.getTime()
        );
        expect(new Date(savedCode.createdAt).getTime()).toBeLessThanOrEqual(
          afterTime.getTime()
        );
      });
    });

    describe('Multiple Order Scenarios', () => {
      it('should handle generating codes for multiple sequential qualifying orders', async () => {
        const qualifyingOrders = [5, 10, 15, 20, 25];

        for (const orderNum of qualifyingOrders) {
          const response = await request(app)
            .post('/api/admin/generate-discount')
            .send({ orderNumber: orderNum });

          expect(response.status).toBe(201);
          expect(response.body.success).toBe(true);
        }

        const allCodes = await DiscountCode.find({});
        expect(allCodes.length).toBe(5);
      });

      it('should maintain separate state for each discount code', async () => {
        // Generate multiple codes
        await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 5 });

        await request(app)
          .post('/api/admin/generate-discount')
          .send({ orderNumber: 10 });

        // Mark one as used
        await DiscountCode.findOneAndUpdate(
          { generatedForOrder: 5 },
          { isUsed: true, usedBy: 'user123' }
        );

        const code5 = await DiscountCode.findOne({ generatedForOrder: 5 });
        const code10 = await DiscountCode.findOne({ generatedForOrder: 10 });

        expect(code5.isUsed).toBe(true);
        expect(code5.usedBy).toBe('user123');
        expect(code10.isUsed).toBe(false);
        expect(code10.usedBy).toBeNull();
      });
    });
  });
});
