import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js"
import Cart from "../models/cartModel.js";
import Review from"../models/reviewModel.js";
import translate from "translate";


translate.engine = "deepl";
translate.key = "6752f66f-207d-4ef5-9c17-acb13e2f995d:fx";

export const loadShop = async (req, res) => {
  try {
    const owner = req.session.user;
    const cartProduct = await Cart.findOne({ owner: owner }).populate('items.productId');

    let query = { isActive: true };
    let categoryid = req.query.id;
    let searchQuery = req.query.query || '';
    let priceRange = req.query.price;
    let filter = {};

    if (categoryid) {
      query.category = categoryid;
    }

    if (searchQuery) {
      query.$or = [{ name: { $regex: searchQuery, $options: 'i' } }];
    }

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(Number);
      filter.price = { $gte: minPrice, $lte: maxPrice };
    }

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
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = {};
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Get total count of products for pagination
    const totalProducts = await Product.countDocuments({ ...query, ...filter });

    // Fetch products with pagination
    const product = await Product.find({ ...query, ...filter })
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const categories = await Category.find();

    res.render("shop", {
      product,
      search: searchQuery,
      cartProduct,
      categories,
      sort: req.query.sort || 'default',
      priceRange,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      limit
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
      const cartData = await Cart.findOne({ owner: id }).populate({
        path: "items.productId",
        model: "Product",
      });
      const review = await Review.find({ product: id }).populate({ path: "user", model: "User" })
        let totalRating = 0
        for (let i = 0; i < review.length; i++) {
            totalRating += review[i].rating
        }
        const averageRating = (review.length > 0) ? (totalRating / review.length) : 0
        product.rating = averageRating
        await product.save()
  
console.log(review,"revewwwwwwwwwwwwwwwwwwwwwwwwwwwww");
        
      res.render("productDetails", { product, spanish, arabic, similar,cartData,review  });
    } catch (error) {
      console.log(error.message);
    }
  };