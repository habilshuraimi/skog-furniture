import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import Address from "../models/addressModel.js";
import randomstring from "randomstring";
import Wallet from "../models/walletModel.js";
import Coupon from "../models/couponModel.js";

async function generateUniqueOrderID() {
  const randomPart = randomstring.generate({
    length: 6,
    charset: "numeric",
  });

  const currentDate = new Date();

  const datePart = currentDate.toISOString().slice(0, 10).replace(/-/g, "");

  const orderID = ` ID_${randomPart}${datePart}`;

  return orderID;
}

export const order = async (req, res) => {
  try {
    const id = req.session.user;
    const { paymentOption, addressType } = req.body;

    if (paymentOption === null) {
      return res.status(400);
    }

    const user = await User.findById(id);

    const cart = await Cart.findOne({ owner: req.session.user }).populate({
      path: "items.productId",
      model: "Product",
    });

    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }

    const orderAddress = await Address.findOne({ user: user._id });
    if (!orderAddress) {
      return res.status(400).json({ message: "Address not found" });
    }

    const addressdetails = orderAddress.addresses.find(
      (item) => item.addressType === addressType
    );

    if (!addressdetails) {
      console.log("error 1");
      return res.status(400).json({
        message: "Invalid address ID",
      });
    }

    const selectedItems = cart.items;

    for (const item of selectedItems) {
      const product = await Product.findOne({ _id: item.productId });

      if (product.stock === 0) {
        console.log("error 2");
        return res.status(400).json({
          message: "product out of stock",
        });
      }

      if (product.stock >= item.quantity) {
        product.stock -= item.quantity;

        await product.save();
      } else {
        console.log("Product not found..............");
      }
    }

    const order_id = await generateUniqueOrderID();

    const orderData = new Order({
      user: user._id,
      cart: cart._id,
      billTotal: cart.billTotal,
      oId: order_id,
      paymentStatus: "Success",
      paymentMethod: paymentOption,
      deliveryAddress: addressdetails,
      coupon: cart.coupon,
      discountPrice: cart.discountPrice,
    });

    for (const item of selectedItems) {
      orderData.items.push({
        productId: item.productId._id,
        image: item.productId.images[0],
        name: item.productId.name,
        productPrice: item.productId.price,
        quantity: item.quantity,
        price: item.price,
      });
    }
    if (orderData.coupon) {
      const coupon = await Coupon.findOne({ couponCode: orderData.coupon });

      if (coupon) {
        // Ensure that usersUsed is an array before pushing
        if (!Array.isArray(coupon.usersUsed)) {
          coupon.usersUsed = [];
          console.log("Initialized usersUsed as an empty array");
        }

        coupon.usersUsed.push(id);

        coupon.users -= 1;

        await coupon.save();
        console.log("Coupon updated and saved");
      } else {
        console.log("Coupon not found");
      }
    }

    await orderData.save();

    cart.items = [];
    cart.billTotal=0
    cart.coupon = null
    await cart.save();

    res.status(200).json({ order_id });
  } catch (error) {
    console.log("Post checkout error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const confirmPage = async (req, res) => {
  const user = req.session.user;
  const orderId = req.query.id;
  const cartProduct = await Cart.findOne({ owner: user }).populate({
    path: "items.productId",
    model: "Product",
  });
  res.render("orderSuccess", { orderId, cartProduct });
};

// function for rendering order status
export const orderView = async (req, res) => {
  try {
    const id = req.query.id;
    const findOrder = await Order.findById(id);

    const proId = [];

    for (let i = 0; i < findOrder.items.length; i++) {
      proId.push(findOrder.items[i].productId);
    }

    const proData = [];

    for (let i = 0; i < proId.length; i++) {
      proData.push(await Product.findById({ _id: proId[i] }));
    }
    const cartData = await Cart.findOne({ owner: req.session.user }).populate({
      path: "items.productId",
      model: "Product",
    });

    res.render("orderView", { findOrder, proData, cartData });
  } catch (error) {
    console.log(error.message);
  }
};

//function for canceling order

export const cancelOrder = async (req, res) => {
  try {
    const user = req.session.user;
    const id = req.body.id;

    const orderData = await Order.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status: "Canceled",
        },
      },
      { new: true }
    );
    if (orderData.status === "Canceled") {
      for (let i = 0; i < orderData.items.length; i++) {
        const productid = orderData.items[i].productId;
        const productData = await Product.findById(productid);
        productData.countInStock += orderData.items[i].quantity;
        await productData.save();
      }
    }

    if (
      orderData.paymentMethod === "Razorpay" ||
      order.paymentMethod === "WALLET"
    ) {
      let wallet = await Wallet.findOne({ user: user });
      if (!wallet) {
        wallet = new Wallet({
          user: user,
          amount: 0,
          orders: [],
        });
      }
      wallet.amount += orderData.billTotal;
      if (orderData.paymentMethod == "Razorpay") {
        wallet.orders.push(orderData._id);
      }
      await wallet.save();
    }

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error.message);
  }
};

export const loadInvoice = async (req, res) => {
  try {
    const id = req.query.id;

    const findOrder = await Order.findById({ _id: id });

    const userData = await User.findById({ _id: findOrder.user });

    const proId = [];

    for (let i = 0; i < findOrder.items.length; i++) {
      proId.push(findOrder.items[i].productId);
    }

    const proData = [];

    for (let i = 0; i < proId.length; i++) {
      proData.push(await Product.findById({ _id: proId[i] }));
    }

    res.render("invoice", { proData, findOrder, userData });
  } catch (error) {
    console.log(`error in invoice ${error.message}`);
  }
};

//function to return  product
export const returnRequest = async (req, res) => {
  try {
    console.log(req.body, "newqsafjhkdsjaklbnha");
    const id = req.body.id;
    const reason = req.body.reasonValue;
    console.log(req.body, "boddd");

    const findOrder = await Order.findById(id);
    if (!findOrder) {
      return res.json({ status: false, message: "Order not found" });
    }
    findOrder.requests.push({
      type: "Return",
      status: "Pending",
      reason: reason,
    });
    await findOrder.save();
    return res.json({ status: true, message: "Order returned" });
  } catch (error) {
    console.log(error.message);
  }
};
