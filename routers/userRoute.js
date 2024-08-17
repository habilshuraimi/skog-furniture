import express from "express";
const userRoute = express();

userRoute.use(express.static("public"));

import { verified } from "../middleware/emailverify.js";
import { isLogged, islogOut } from "../middleware/userAuth.js";
import {
  changePassword,
  forgetEmailCheck,
  forgetLoad,
  forgetPage,
  loadEmail,
  loadHome,
  loadOtp,
  loadSignup,
  loadlogin,
  resendOtp,
  saveUser,
  verifyLogin,
  verifyOtp,
} from "../controllers/userController.js";
import {
  addToCart,
  adding,
  clearCart,
  deleteItem,
  loadCart,
  removing,
} from "../controllers/cartController.js";
import { loadProductDetails, loadShop } from "../controllers/shopController.js";
import { loadCheckout } from "../controllers/checkOutController.js";
import {
  editAddress,
  loadAddAddress,
  loadProfile,
  logout,
  saveAddress,
} from "../controllers/profileControler.js";
import {
  cancelOrder,
  confirmPage,
  loadInvoice,
  order,
  orderView,
  returnRequest,
} from "../controllers/orderController.js";
import {
  createOrder,
  verifyPayment,
} from "../controllers/paymentController.js";
import {
  addToWishList,
  loadWishlist,
  removingItem,
} from "../controllers/wishlistController.js";
// import { loadSearch } from "../controllers/searchController.js";
import { applyCoupon } from "../controllers/copupon controller.js";
import { isBlocked } from "../middleware/block.js";
import { rateProduct, } from "../controllers/reviewController.js";

userRoute.set("view engine", "ejs");
userRoute.set("views", "./views/user");

userRoute.get("/", loadHome);
userRoute.get("/shop",isBlocked,loadShop);
userRoute.get("/productDetails",isBlocked, loadProductDetails);
userRoute.post('/rating',isLogged,isBlocked,rateProduct);


userRoute.get("/wishlist",isLogged,isBlocked, loadWishlist);
userRoute.post("/addWishlist",isLogged,isBlocked, addToWishList);
userRoute.get("/deleteWishlist",isLogged,isBlocked, removingItem);



userRoute.get("/cart", isLogged,isBlocked, loadCart);
userRoute.get("/addCart", isLogged,isBlocked, addToCart);
userRoute.post("/increment", adding);
userRoute.post("/decrement", removing);
userRoute.get("/clearCart",clearCart)
userRoute.post("/cartremove",deleteItem)




userRoute.get("/checkout",isBlocked, isLogged, loadCheckout);
userRoute.post('/applyCoupon',isLogged,isBlocked,applyCoupon)
userRoute.post("/order",isBlocked, isLogged, order);
userRoute.post("/return",isLogged,isBlocked,returnRequest)

userRoute.get('/invoice',isLogged,isBlocked,loadInvoice)

userRoute.get("/confirmOrder",isLogged,isBlocked, confirmPage);
userRoute.post("/createOrder",isLogged,isBlocked, createOrder);
userRoute.post("/verifyPayment",isLogged,isBlocked, verifyPayment);
userRoute.post("/cancelOrder",isLogged,isBlocked, cancelOrder);
userRoute.get("/orderView",isBlocked , isLogged, orderView);

userRoute.post("/review",isBlocked , isLogged,rateProduct)


userRoute.get("/email", loadEmail);
userRoute.post("/otp", loadOtp);
userRoute.post("/resendOtp", resendOtp);
userRoute.post("/verify", verifyOtp);
userRoute.get("/signup", verified, loadSignup);
userRoute.post("/register", saveUser);

userRoute.get("/login", islogOut, loadlogin);
userRoute.post("/login", verifyLogin);
userRoute.get("/forget", islogOut, forgetLoad);
userRoute.post("/forget", forgetEmailCheck);
userRoute.get("/forgetPassword",forgetPage)
userRoute.post('/changePass',changePassword)

userRoute.get("/profile", isLogged,isBlocked, loadProfile);
userRoute.get("/addAddress",isLogged,isBlocked, loadAddAddress);
userRoute.post("/addAddress",isLogged,isBlocked, saveAddress);
userRoute.post("/editAddress",isLogged,isBlocked, editAddress);
userRoute.get("/logout", logout);

export default userRoute;
