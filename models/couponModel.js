import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    description:{
      type:String
    },
    startDate: {
      type: String,
      require: true,
    },
    EndDate: {
      type: String,
      require: true,
    },
    minimumAmount: {
      type: Number,
      require: true,
    },
    maximumAmount: {
      type: Number,
      require: true,
    },
    discount: {
      type: Number,
      require: true,
    },
    couponCode: {
      type: String,
      require: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    users:{
      type:Array,
    },
    usersUsed: [{
      type: String,
  }],
  },
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon