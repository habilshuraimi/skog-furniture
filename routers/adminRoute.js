import express from "express";
import multer from "multer";
const adminRouter = express();
import { adminLogged } from "../middleware/adminAuth.js"


import { adminLoginLoad, adminlogOut, loadAdminHome, verifyAdminLogin } from "../controllers/adminController.js";

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
import { orderDetails, orders } from "../controllers/orderMgtController.js";

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



adminRouter.get("/",adminLoginLoad);
adminRouter.get ("/adminLogin",adminLoginLoad)
adminRouter.post ("/adminLogin",verifyAdminLogin)
adminRouter.get("/adminHome",loadAdminHome)
adminRouter.get("/logout",adminlogOut)



adminRouter.get("/users", adminLogged,loadUsers);
adminRouter.get("/blockUser", blockUser);
adminRouter.get("/unblockUser", unBlockUser);

adminRouter.get("/categories",adminLogged, loadCategories);
adminRouter.post("/categories", saveCategories);
adminRouter.get("/editCategory", editCategoryload);
adminRouter.post("/saveEdit", editCategory);
adminRouter.get("/deleteCategory", deleteCategory);

adminRouter.get("/products",adminLogged, loadproducts);
adminRouter.get("/addProduct", loadAddProduct);
adminRouter.post("/addProduct", upload, saveProduct);
adminRouter.get("/editProduct", upload, editProductload);
adminRouter.post("/editProduct", upload, editProduct);


adminRouter.get('/orders',adminLogged,orders)
adminRouter.get("/adminorderdetails",orderDetails)



export default adminRouter;
