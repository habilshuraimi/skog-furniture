import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import Address from "../models/addressModel.js";
import randomstring from "randomstring";

// to load cart
export const loadCart = async (req, res) => {
  try {
    const owner = req.session.user;
    const cartData = await Cart.findOne({ owner: owner }).populate({
      path: "items.productId",
      model: "Product",
    });
    console.log(cartData,"cartdata")
    const proData = cartData ? cartData.items.map(item => item.productId) : [];

    let discountPercent = 0;
    if (req.query.couponCode) {
        const coupon = await Coupon.findOne({ couponCode: req.query.couponCode, isActive: true });
        if (coupon) {
            const currentDate = new Date().toISOString().split('T')[0];
            if (currentDate >= coupon.startDate && currentDate <= coupon.EndDate) {
                discountPercent = coupon.discount;
            }
        }
    }

    res.render("shopCart", { cartData, proData,discountPercent });
  } catch (error) {
    console.log(error.message);
  }
};

// to save items to cart
export const addToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    let userCart = await Cart.findOne({ owner: req.session.user });
    if (!userCart) {
      userCart = new Cart({ owner: req.session.user, items: [] });
    }

    const existingCartItem = userCart.items.find(item => item.productId.toString() === productId);

    if (existingCartItem) {
      if (existingCartItem.quantity + 1 <= product.stock && existingCartItem.quantity < 5) {
        existingCartItem.quantity += 1;
        existingCartItem.price = existingCartItem.quantity * product.discountPrice;
        product.stock -= 1;
      } else if (existingCartItem.quantity >= product.stock) {
        return res.status(409).json({ message: "Stock Limit Exceeded" });
      } else {
        return res.status(400).json({ message: "Maximum quantity per person reached" });
      }
    } else {
      userCart.items.push({ productId: productId, quantity: 1, price: product.discountPrice });
      product.stock -= 1;
    }

    userCart.billTotal = userCart.items.reduce((total, item) => total + item.price, 0);
    await userCart.save();
    await product.save();

    return res.redirect("/cart");
  } catch (error) {
    console.log("Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adding = async (req, res) => {
  try {
    const { productId } = req.body;

    const cartData = await Cart.findOne({ owner: req.session.user }).populate("items.productId");
    if (!cartData) {
      return res.status(400).json({ status: false, message: "Cart not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ status: false, message: "Product not found" });
    }

    const cartItem = cartData.items.find(item => item.productId._id.equals(productId));
    if (cartItem) {
      if (cartItem.quantity < product.stock && cartItem.quantity < 5) {
        cartItem.quantity += 1;
        cartItem.price = cartItem.quantity * product.discountPrice;
        cartData.billTotal += product.discountPrice;
        product.stock -= 1;
        await cartData.save();
        await product.save();

        return res.json({ status: true, cartTotal: cartData.billTotal });
      } else if (cartItem.quantity >= 5) {
        return res.json({ status: "max", message: "Maximum quantity per product is 5" });
      } else {
        return res.json({ status: "low" });
      }
    } else {
      if (1 <= product.stock) {
        cartData.items.push({ productId: productId, quantity: 1, price: product.discountPrice });
        cartData.billTotal += product.discountPrice;
        product.stock -= 1;
        await cartData.save();
        await product.save();

        return res.json({ status: true, cartTotal: cartData.billTotal });
      } else {
        return res.json({ status: "low" });
      }
    }
  } catch (error) {
    console.log("Increment Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};







export const removing = async (req, res) => {
  try {
    const { productId } = req.body;

    const cartData = await Cart.findOne({ owner: req.session.user }).populate("items.productId");
    if (!cartData) {
      return res.status(400).json({ status: false, message: "Cart not found" });
    }

    const cartItem = cartData.items.find(item => item.productId._id.equals(productId));
    if (cartItem && cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      cartItem.price = cartItem.quantity * cartItem.productId.discountPrice;
      cartData.billTotal -= cartItem.productId.discountPrice;
      cartItem.productId.stock += 1;
      await cartData.save();
      await cartItem.productId.save();

      return res.json({ status: true, total: cartData.billTotal });
    } else {
      return res.json({ status: "minimum" });
    }
  } catch (error) {
    console.log("Decrement Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};













