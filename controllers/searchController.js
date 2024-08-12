import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

export const loadSearch = async (req, res) => {
   try {
       const searchQuery = req.query.q.toLowerCase();
       // Find the category based on the search query
       const category = await Category.findOne({ name: searchQuery });
       const user = req.session.user

       if (!category) {
           console.log("Category not found");
           return res.render('shop', { user, product: [] });
       }

       // Find products based on the category name
       const ProductDetails = await Product.find({ category: category._id }).populate('category');

       const cartProduct = await Cart.findOne({ owner: id }).populate('items.productId');


       res.render('shop', { user, product: ProductDetails,cartProduct });

   } catch (error) {
       if (error.message.includes("Cannot read properties of undefined")) {
           console.log("Category not found, rendering shop without product images");

       } else {
           console.log(error.message);
           res.status(500).send("Error retrieving products");
       }
   }
}