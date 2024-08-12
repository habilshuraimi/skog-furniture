import express from "express";
import multer from "multer";
const adminRouter = express();
import { adminLogged } from "../middleware/adminAuth.js";

import {
  adminLoginLoad,
  adminlogOut,
  getChartData,
  loadAdminHome,
  loadBestSeling,
  verifyAdminLogin,
} from "../controllers/adminController.js";

import {
  deleteCategory,
  editCategory,
  editCategoryload,
  loadCategories,
  saveCategories,
} from "../controllers/categoriesController.js";

import {
  blockUser,
  loadUsers,
  unBlockUser,
} from "../controllers/usersMgtController.js";

import {
  editProduct,
  editProductload,
  loadAddProduct,
  loadproducts,
  saveProduct,
} from "../controllers/productsController.js";
import {
  acceptReturn,
  orderDetails,
  orders,
  rejectReturn,
  updateOrderStatus,
} from "../controllers/orderMgtController.js";
import {
  loadAddCoupon,
  loadCoupon,
  saveCoupon,
  toggleCoupon,
} from "../controllers/copupon controller.js";
import { filterCustomDateOrder, filterReoprt, salesreport } from "../controllers/salesController.js";
import {
  loadCateOffer,
  loadOfferCatetgoryAdd,
  loadOfferProductAdd,
  loadProductOffer,
  saveOfferCate,
  saveOfferProduct,
} from "../controllers/offerController.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/productImages");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now());
  },
});

const upload = multer({
  storage: storage,
  createParentPath: true, // This option will create the directory if it doesn't exist
}).array("images");

adminRouter.set("view engine", "ejs");
adminRouter.set("views", "./views/admin");

adminRouter.get("/", adminLoginLoad);
adminRouter.post("/adminLogin", verifyAdminLogin);
adminRouter.get("/adminHome", adminLogged, loadAdminHome);
adminRouter.get("/bestselling", loadBestSeling);
adminRouter.get("/logout", adminlogOut);
adminRouter.get("/chart",adminLogged,getChartData);

adminRouter.get("/users", adminLogged, loadUsers);
adminRouter.get("/blockUser", adminLogged, blockUser);
adminRouter.get("/unblockUser", adminLogged, unBlockUser);

adminRouter.get("/categories", adminLogged, loadCategories);
adminRouter.post("/categories", adminLogged, saveCategories);
adminRouter.get("/editCategory", adminLogged, editCategoryload);
adminRouter.post("/saveEdit", adminLogged, editCategory);
adminRouter.get("/deleteCategory", adminLogged, deleteCategory);

adminRouter.get("/products", adminLogged, loadproducts);
adminRouter.get("/addProduct", adminLogged, loadAddProduct);
adminRouter.post("/addProduct", adminLogged, upload, saveProduct);
adminRouter.get("/editProduct", adminLogged, upload, editProductload);
adminRouter.post("/editProduct", adminLogged, upload, editProduct);

adminRouter.get("/orders", adminLogged, orders);
adminRouter.get("/adminorderdetails", adminLogged, orderDetails);
adminRouter.post("/updateOrderStatus", adminLogged, updateOrderStatus);
adminRouter.post("/acceptCancel",adminLogged,acceptReturn)
adminRouter.post('/rejectCancel',adminLogged,rejectReturn)

adminRouter.get("/coupon", adminLogged, loadCoupon);
adminRouter.get("/addCoupon", adminLogged, loadAddCoupon);
adminRouter.post("/addCoupon", adminLogged, saveCoupon);
adminRouter.post("/togglecoupon", adminLogged, toggleCoupon);

adminRouter.get("/productOffer", adminLogged, loadProductOffer);
adminRouter.get("/addOfferProduct", adminLogged, loadOfferProductAdd);
adminRouter.post("/addOfferProduct", adminLogged, saveOfferProduct);

adminRouter.get("/categoryOffer", adminLogged, loadCateOffer);
adminRouter.get("/addOfferCategory", adminLogged, loadOfferCatetgoryAdd);
adminRouter.post("/addOfferCategory", adminLogged, saveOfferCate);

adminRouter.get("/salesReport", salesreport);
adminRouter.post("/salesReportSelectFilter", adminLogged,filterReoprt)
adminRouter.post("/fileterDateRange", adminLogged,filterCustomDateOrder)
export default adminRouter;
