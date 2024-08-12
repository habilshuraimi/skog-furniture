import Product from "../models/productModel.js";
import WishList from "../models/wishlistModel.js";
import Cart from "../models/cartModel.js";

// function for loading wishlist
export const loadWishlist = async (req, res) => {
  try {
    let id;
    if (req.session.passport) {
      id = req.session.passport.user._id;
    } else {
      id = req.session.user;
    }
    const wishlist = await WishList.findOne({ user: id })
      .populate("user")
      .populate("product");
      const cartData = await Cart.findOne({ owner: id }).populate({
        path: "items.productId",
        model: "Product",
      });
    res.render("wishlist", {  wishlist,cartData });
  } catch (error) {
    console.log(error.message);
  }
};

// function for adding a product to wishlist

export const addToWishList = async (req, res) => {
  try {
    let user;
    if (req.session.passport) {
      user = req.session.passport.user._id;
    } else {
      user = req.session.user;
    }
    const productId = req.body.productId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishList = await WishList.findOne({ user });
    console.log(wishList,"gfgjkhgfhgf,jg")
    if (!wishList || wishList === null ) {
      wishList = new WishList({
        user: user,
        product:[]
      })
      wishList.product.push(productId);
    } else {
      let existingProduct = wishList.product.find(
        (item) => item.toString() === productId
      );
      if (existingProduct) {
        return res
          .status(409)
          .json({ success: false, message: "Product already in wishlist" });
      } else {
        wishList.product.push(productId);
      }
    }
    // console.log(wishList,'wlllllllllllll');
    await wishList.save();
    console.log("one");

    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const removingItem = async (req, res) => {
  try {
    const id = req.session.user;
    const productId = req.query.id;

    console.log(`User ID: ${id}`);
    console.log(`Product ID to remove: ${productId}`);

    const userWishList = await WishList.findOne({ user: id }).populate(
      "product"
    );

    if (userWishList) {
      await userWishList.updateOne({ $pull: { product: productId } });
      console.log(`Product ${productId} removed from wishlist`);
      res.redirect("/wishlist");
    } else {
      res.status(404).json({ success: false, message: "Wishlist not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};
