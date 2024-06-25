import mongoose from "mongoose";
const objectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema(
  {
    owner: {
      type: objectId,
      required: true,
      ref: "Users",
    },
    items: [
      {
        productId: {
          type: objectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "atleast 1 item required"],
          default: 1,
        },
        price: {
          type: Number,
        },
        selected: {
          type: Boolean,
          default: false,
          
        },
      },
    ],
    billTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    isApplied: {
      type: Boolean,
      default: false,
    },
    coupon: {
      type: String,
      default: null,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart',cartSchema)

export default Cart
