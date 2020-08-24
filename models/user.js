const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    count: {
      type: Number,
      default: 0,
    },
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId, quantity) {
  const deletedItem = this.cart.items.filter((p) => {
    return p.productId._id.toString() === productId;
  });
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId;
  });

  if (deletedItem.quantity - quantity > 0) {
    deletedItem.quantity = deletedItem.quantity - quantity;
    this.cart.items = [...updatedCartItems, deletedItem];
  } else {
    deletedItem.quantity = 0;
    this.cart.items = updatedCartItems;
  }
  this.cart.count = this.cart.count - quantity;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [], count: 0 };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
