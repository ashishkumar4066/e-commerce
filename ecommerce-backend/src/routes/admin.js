const express = require('express');
const DiscountCode = require('../models/DiscountCode');
const Order = require('../models/Order');
const router = express.Router();

const nthOrder = 5;
router.post('/generate-discount', async (req, res) => {
  try {
    const { orderNumber } = req.body;
    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'orderNumber is required',
      });
    }
    if (!Number.isInteger(orderNumber) || orderNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: 'orderNumber must be a positive integer',
      });
    }

    if (orderNumber % nthOrder !== 0) {
      return res.status(400).json({
        success: false,
        message: `Order #${orderNumber} doesn't qualify for discount. Only orders ${nthOrder}, ${
          nthOrder * 2
        }, ${nthOrder * 3}... qualify.`,
        qualifyingOrders: `Next qualifying order: #${
          Math.ceil(orderNumber / nthOrder) * nthOrder
        }`,
      });
    }
    const existingCode = await DiscountCode.findOne({
      generatedForOrder: orderNumber,
    });

    if (existingCode) {
      if (existingCode.isUsed) {
        return res.status(200).json({
          status: false,
          message: 'Discount code already exists and has been used',
        });
      } else {
        return res.status(200).json({
          status: false,
          message: 'Discount Code already exists but not used',
        });
      }
    }

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderNumber} not found in system. Cannot generate discount for non-existent order.`,
      });
    }
    const newCode = `DISCOUNT${orderNumber}`;

    const newDiscountCode = new DiscountCode({
      code: newCode,
      percentage: 10,
      isUsed: false,
      generatedForOrder: orderNumber,
      usedBy: null,
    });

    await newDiscountCode.save();

    return res.status(201).json({
      success: true,
      message: `Discount code generated successfully for order #${orderNumber}`,
      discountCode: {
        code: newCode,
        percentage: 10,
        generatedForOrder: orderNumber,
        isUsed: false,
        createdAt: newDiscountCode.createdAt,
      },
    });
  } catch (error) {
    console.error('Generate discount error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
