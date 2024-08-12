import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Wallet from "../models/walletModel.js";

export const orders = async (req, res) => {
  const order = await Order.find();
  res.render("orders", { order });
};

export const orderDetails = async (req, res) => {
  const id = req.query.id;
  const orders = await Order.findById(id).populate("user");
  res.render("orderDetails", { orders });
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { newStatus, orderId } = req.body;
    const order = await Order.findOne({ oId: orderId });
    if (!order) {
      console.log("Error: Order not found");
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update product count if the status is "Canceled"
    if (newStatus === "Canceled") {
      for (const orderItem of order.items) {
        const product = await Product.findById(orderItem.productId);
        if (product) {
          product.stock += orderItem.quantity;
          await product.save();
        }
      }
    }

    order.status = newStatus;
    await order.save();

    return res.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update order status" });
  }
};

//accept and reject return

export const acceptReturn = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    const cancelOrder = await Order.findOne({ oId: orderId });
    console.log(cancelOrder,"ccccc")
    if (!cancelOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    for (let orderItem of cancelOrder.items) {
      let product = await Product.findById(orderItem.productId).exec();
      if (product) {
        product.quantity += Number(orderItem.quantity);
        await product.save();
      }
    }
    for (let request of cancelOrder.requests) {
      if (request.status === "Pending") {
        const newStatus = "Returned";
        console.log( request._id,"second")

        const updatedOrder = await Order.findOneAndUpdate(
          { oId: orderId, 'requests._id': request._id }, // Match the specific request by its ID.
          {
              $set: {
                  status: newStatus,
                  'requests.$.status': 'Accepted' // Update the matched request status.
              }
          },
          { new: true }
      );
      if (!updatedOrder) {
          return res.status(404).json({ success: false, message: "Failed to update order status" });
      }
  }
}

    if (cancelOrder.paymentMethod === "Razorpay") {
      let wallet = await Wallet.findOne({ user: user._id });
      if (!wallet) {
        wallet = new Wallet({
          user: user._id,
          balance: 0,
          order: cancelOrder._id,
        });
      }
      wallet.balance += cancelOrder.billTotal;
      if (cancelOrder.paymentMethod === "Razorpay") {
         wallet.orders.push(cancelOrder._id);
      }
      await wallet.save();
    }
    console.log("third")
    return res
      .status(200)
      .json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.log(error.message);
  }
};




export const rejectReturn = async (req, res) => {
  try {
    const { orderId } = req.body;

    const cancelOrder = await Order.findOne({ oId: orderId });
    console.log(cancelOrder,"ccccc")
    if (!cancelOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }


    for (let orderItem of cancelOrder.items) {
      let product = await Product.findById(orderItem.productId).exec();
      if (product) {
        product.quantity += Number(orderItem.quantity);
        await product.save();
      }
    }
    for (let request of cancelOrder.requests) {
      if (request.status === "Pending") {
        console.log( request._id,"second")

        const updatedOrder = await Order.findOneAndUpdate(
          { oId: orderId, 'requests._id': request._id }, // Match the specific request by its ID.
          {
              $set: {
                  'requests.$.status': 'Rejected' // Update the matched request status.
              }
          },
          { new: true }
      );
      if (!updatedOrder) {
          return res.status(404).json({ success: false, message: "Failed to update order status" });
      }
  }
}

  
    return res
      .status(200)
      .json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.log(error.message);
  }
};