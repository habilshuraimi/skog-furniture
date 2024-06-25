import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js"
import Cart from "../models/cartModel.js";
import translate from "translate";

translate.engine = "deepl";
translate.key = "6752f66f-207d-4ef5-9c17-acb13e2f995d:fx";

export const loadShop = async (req, res) => {
  try {
      const owner = req.session.user;
      const cartProduct = await Cart.findOne({ owner: owner }).populate('items.productId');

      let sortOption = {};
      switch (req.query.sort) {
          case 'priceAsc':
              sortOption = { price: 1 };
              break;
          case 'priceDsc':
              sortOption = { price: -1 };
              break;
              case 'nameAsc':
              sortOption = { name: 1 };
              break;
              case 'nameDsc':
                sortOption = { name: -1 };
                break;
          // case 'popularity':
          //     sortOption = { popularity: -1 }; // Assuming you have a popularity field
          //     break;
          // case 'rating':
          //     sortOption = { averageRating: -1 }; // Assuming you have an averageRating field
          //     break;
          case 'latest':
              sortOption = { createdAt: -1 };
              break;
          default:
              sortOption = { name: 1 };
      }

      const product = await Product.find().sort(sortOption);
      const categories = await Category.find(); // Assuming you have categories

      res.render("shop", {
          product,
          cartProduct,
          categories,
          sort: req.query.sort || 'default'
      });

  } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
  }
};


  export const loadProductDetails = async (req, res) => {
    try {
      const id = req.query.id;
      const product = await Product.findById({ _id: id });
      const similar = await Product.find({ category: product.category });
      const spanish = await translate(product.description, "es");
      const arabic = await translate(product.description, "ar");
      console.log(product.stock)
  
  
      res.render("productDetails", { product, spanish, arabic, similar });
    } catch (error) {
      console.log(error.message);
    }
  };