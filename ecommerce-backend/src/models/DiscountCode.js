const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    percentage: {
      type: Number,
      default: 10,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedBy: {
      type: String,
      default: null,
    },
    generatedForOrder: {
      type: Number,
      required: true,
    },
    usedInOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DiscountCode', discountCodeSchema);
