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
    const proData = [];

    if (cartData) {
      const arr = cartData.items.map((item) => item.productId);
      for (const productId of arr) {
        proData.push(await Product.findById(productId));
      }
    }
    res.render("shopCart", { cartData, proData });
  } catch (error) {
    console.log(error.message);
  }
};

// to save items to cart
export const addToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    console.log(`Product ID: ${productId}`);

    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found");
      return res.status(400).json({ message: "Product not found" });
    }

    let userCart = await Cart.findOne({ owner: req.session.user });
    if (!userCart) {
      userCart = new Cart({
        owner: req.session.user,
        items: [],
      });
    }

    const existingCartItem = userCart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingCartItem) {
      if (
        existingCartItem.quantity + 1 <= product.stock &&
        existingCartItem.quantity < 5
      ) {
        existingCartItem.quantity += 1;
        existingCartItem.price =
          existingCartItem.quantity * product.discountPrice;
      } else if (existingCartItem.quantity >= product.stock) {
        return res.status(409).json({ message: "Stock Limit Exceeded" });
      } else {
        return res
          .status(400)
          .json({ message: "Maximum quantity per person reached" });
      }
    } else {
      userCart.items.push({
        productId: productId,
        quantity: 1,
        price: product.discountPrice,
      });
    }

    userCart.billTotal = userCart.items.reduce(
      (total, item) => total + item.price,
      0
    );

    await userCart.save();
    console.log("Product added to cart successfully");
    return res.redirect("/cart");
  } catch (error) {
    console.log("Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adding = async (req, res) => {
  try {
    let { qty, sub, rate, cartTotal, productId } = req.body;
    const proId = productId.toString();
    qty = parseInt(qty);

    const cartData = await Cart.findOne({ owner: req.session.user });
    let response;
    if (qty > 9) {
      response = { status: "maximum" };
    } else {
      const product = await Product.findOne({ _id: proId });

      if (cartData) {
        const stock = cartData.items.find((value) =>
          value.productId.equals(proId)
        );

        const proQuantity = parseInt(stock.quantity);
        const availableQuantity = parseInt(product.stock);
        if (availableQuantity > proQuantity) {
          await Cart.findOneAndUpdate(
            { owner: req.session.user, "items.productId": proId },
            {
              $inc: {
                "items.$.price": rate,
                "items.$.quantity": 1,
                billTotal: rate,
              },
            }
          );
          response = { status: true, cartTotal: cartData.billTotal };
        } else {
          response = { status: "low" };
        }
      }
      res.json(response);
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const removing = async (req, res) => {
  try {
    const { rate, productId, qty, sub } = req.body;
    const proIdString = productId.toString();
    const quantity = parseInt(qty);

    if (quantity > 1) {
      const addPrice = await Cart.findOneAndUpdate(
        { owner: req.session.user, "items.productId": proIdString },
        {
          $inc: {
            "items.$.price": -rate,
            "items.$.quantity": -1,
            "items.$.subTotal": -rate,
            totalPrice: -rate,
          },
        }
      );

      const findCart = await Cart.findOne({ owner: req.session.user });

      res.json({ status: true, total: findCart.totalPrice });
    } else {
      res.json({ status: "minimum" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

