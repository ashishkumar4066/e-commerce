const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    // Custom ID from your source data (indexed for faster lookup)
    productId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Price cannot be negative
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true, // Useful if you filter by category often
    },
    image: {
      type: String,
      required: true,
    },
    // Nested Object for Rating
    rating: {
      rate: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    stock: {
      type: Number,
      required: true,
      default: 20,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
