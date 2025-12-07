const express = require('express');
const Order = require('../models/Order');
const DiscountCode = require('../models/DiscountCode');
const Product = require('../models/Product');
const { log } = require('console');
const router = express.Router();

const nthOrder = 5; //5,10,15...

// Check if coupon is valid for current order number
router.post('/checkIsCouponValid', async (req, res) => {
  try {
    const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
    const currentOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
    if (currentOrderNumber % nthOrder == 0) {
      return res.status(200).json({
        success: true,
        message: 'Coupon is valid',
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'Coupon is not valid',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong!',
    });
  }
});

// Place Order API by the User
router.post('/placeOrder', async (req, res) => {
  try {
    const { userId, items, totalItems, totalAmount, discountCode } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    // Validate stock availability for all items before placing order
    for (const item of items) {
      const product = await Product.findOne({ productId: item.productId });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Cannot add ${item.quantity} of ${product.title}. Only ${product.stock} items available in stock`,
        });
      }
    }

    const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
    const currentOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

    console.log('lastOrder ' + lastOrder);
    console.log('currentOrderNumber ' + currentOrderNumber);
    let discountAmount = 0;
    // Changing the Discount code status
    if (discountCode) {
      const discountCodeSchema = await DiscountCode.findOne({
        code: discountCode,
      });
      if (!discountCodeSchema) {
        return res.status(400).json({
          success: false,
          error: 'Coupon code is invalid',
        });
      }
      if (discountCodeSchema.isUsed) {
        return res.status(400).json({
          success: false,
          error: 'Discount code has already been used',
        });
      }

      // Check if discount code can be applied for current order number
      if (discountCodeSchema.generatedForOrder !== currentOrderNumber) {
        return res.status(400).json({
          success: false,
          error: `This discount code can only be applied for order #${discountCodeSchema.generatedForOrder}. Your current order is #${currentOrderNumber}`,
        });
      }

      discountCodeSchema.isUsed = true;
      discountCodeSchema.usedBy = userId;

      discountAmount = (totalAmount * discountCodeSchema.percentage) / 100;
      await discountCodeSchema.save();
    }
    const finalCalculatedAmount = totalAmount - discountAmount;

    let payload;

    console.log('finalCalculatedAmount ' + finalCalculatedAmount);
    payload = {
      userId: userId,
      items: [...items],
      orderNumber: currentOrderNumber,
      totalAmount: totalAmount,
      totalItems: totalItems,
      discountCode: discountCode,
      discountAmount: discountAmount,
      finalAmount: finalCalculatedAmount,
    };
    const newOrder = new Order({ ...payload });
    await newOrder.save();

    // Reduce stock for each item in the order
    for (const item of items) {
      await Product.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // nth logic - generate discount code for next order if it qualifies and doesn't exist
    const nextOrderNumber = currentOrderNumber + 1;
    if (nextOrderNumber % nthOrder == 0) {
      const existingDiscountCode = await DiscountCode.findOne({
        generatedForOrder: nextOrderNumber,
      });

      if (!existingDiscountCode) {
        let payload = {
          code: `DISCOUNT${nextOrderNumber}`,
          percentage: 10,
          isUsed: false,
          generatedForOrder: nextOrderNumber,
        };
        const newDiscountCode = new DiscountCode({ ...payload });
        await newDiscountCode.save();
      }
    }
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      body: payload,
    });
  } catch (error) {
    console.error('Place order error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Fetch all orders by Admin
router.get('/fetchAllOrder', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      body: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
module.exports = router;
