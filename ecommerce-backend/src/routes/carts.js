const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// POST - Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Validation
    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'userId, productId, and quantity are required',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0',
      });
    }

    // Check if product exists and get current price
    const product = await Product.findOne({ productId: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${product.stock} items available in stock`,
      });
    }

    // Find cart for this user
    let cart = await Cart.findOne({ userId });

    // CASE 1: Cart doesn't exist - create new cart
    if (!cart) {
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            quantity,
            price: product.price,
          },
        ],
      });
      await cart.save();

      // Populate product details for response
      await cart.populate('items.productId');

      return res.status(201).json({
        success: true,
        message: 'Cart created and item added successfully',
        body: {
          userId: cart.userId,
          items: cart.items.map((item) => ({
            productId: productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price,
          })),
          totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: cart.items.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
          ),
        },
      });
    }

    // CASE 2 & 3: Cart exists - check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      // CASE 3: Product exists - update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check if new quantity exceeds stock
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          error: `Cannot add ${quantity} more. Only ${
            product.stock - cart.items[existingItemIndex].quantity
          } items available`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price; // Update to current price
    } else {
      // CASE 2: Product doesn't exist - add new item
      cart.items.push({
        productId,
        quantity,
        price: product.price,
      });
    }

    // Save cart
    await cart.save();

    // Populate product details for response
    await cart.populate('items.productId');

    return res.json({
      success: true,
      message:
        existingItemIndex > -1
          ? 'Item quantity updated'
          : 'New item added to cart',
      body: {
        userId: cart.userId,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price,
        })),
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cart.items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        ),
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET - Get user's cart
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.json({
        success: true,
        body: {
          userId,
          items: [],
          totalItems: 0,
          subtotal: 0,
        },
      });
    }

    res.json({
      success: true,
      body: {
        userId: cart.userId,
        items: cart.items.map((item) => ({
          productId: item.productId,
          name: item.productId.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price,
          image: item.productId.image,
        })),
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cart.items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE - Remove item from cart
router.delete('/:userId/item/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found',
      });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    await cart.save();

    // If cart is empty, you might want to delete it
    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return res.json({
        success: true,
        message: 'Item removed. Cart is now empty',
        cart: {
          userId,
          items: [],
          totalItems: 0,
          subtotal: 0,
        },
      });
    }

    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        userId: cart.userId,
        items: cart.items.map((item) => ({
          productId: item.productId._id,
          name: item.productId.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price,
        })),
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cart.items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT - Update item quantity in cart
router.put('/:userId/item/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required',
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart',
      });
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${product.stock} items available in stock`,
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update to current price

    await cart.save();
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Item quantity updated',
      cart: {
        userId: cart.userId,
        items: cart.items.map((item) => ({
          productId: item.productId._id,
          name: item.productId.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price,
        })),
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cart.items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE - Clear entire cart
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    await Cart.deleteOne({ userId });

    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
