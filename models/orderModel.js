import mongoose from 'mongoose'
const ObjectID = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({
      user: {
        type: ObjectID,
        ref: 'User',
        required: true,
      },
      cart: {
        type: ObjectID,
        ref: 'carts',
      },
      oId: {
        type: String,
        required: true,
      },

      items: [{
        productId: {
          type: ObjectID,
          ref: 'products',
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        productPrice: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity can not be less than 1.'],
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      }],
      billTotal: {
        type: Number,
        required: true,
      },
      paymentMethod: {
        type: String,
      },
      paymentStatus: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending',
      },
      deliveryAddress: {
        type:           {
          addressType: String,
          houseNo: String,
          street: String,
          landmark: String,
          pincode: Number,
          city: String,
          district:String,
          state: String,
        },
        required: true,
      },
      orderDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled', 'Returned'],
        default: 'Pending'
      },
      reason: {
        type: String
      },


      requests: [{
        type: {
          type: String,
          enum: ['Cancel', 'Return'],
        },
        status: {
          type: String,
          enum: ['Pending', 'Accepted', 'Rejected'],
          default: 'Pending',
        },
        reason: String,
        // Add other fields as needed for your specific use case
      }, ],
    coupon:{
        type:String
    },
    discountPrice:{
      type: Number,
      default: 0,
   }

    },
  {
    timestamps: true
  , strictPopulate: false });

const Order = mongoose.model('Order', orderSchema);
export default Order

