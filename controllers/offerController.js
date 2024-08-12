import ProductOffer from "../models/OffProductModel.js";
import CategoryOffer from "../models/OffCategoryModel.js";

import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";


export const loadProductOffer = async (req, res) => {
  const offProductData = await ProductOffer.find({}).populate({
    path: "productOfffer.product",
    select: "name",
  });
  console.log(offProductData, "......");
  res.render("offerProduct", { offProductData });
};

export const loadOfferProductAdd = async (req, res) => {
  try {
    const productData = await Product.find({});

    res.render("offerProductAdd", { productData });
  } catch (error) {
    console.log(error.message);
  }
};

export const saveOfferProduct = async (req, res) => {
  try {
    const { name, startingDate, endingDate, products, productDiscount } =
      req.body;

    const offerProduct = new ProductOffer({
      name: name,
      startingDate: startingDate,
      endingDate: endingDate,
      productOfffer: { product: products, discount: productDiscount },
    });
    await offerProduct.save();
    res.redirect("/admin/productOffer");
  } catch (error) {
    console.log(error.message);
  }
};

export const loadCateOffer = async (req, res) => {
    try {
        const OffCateData = await CategoryOffer.find({}).populate({
            path: "categoryOffer.category",
            select: "name"
        });
        res.render("offerCategory", { OffCateData });
    } catch (error) {
        console.log(error.message);
    }
};


export const loadOfferCatetgoryAdd = async (req, res) => {
    try {

        const categoryData = await Category.find({})
        res.render("offerCategoryAdd",{categoryData})

    } catch (error) {
        console.log(error.message)
    }

};

export const saveOfferCate = async(req,res)=>{
    try {
        const {name,startingDate,endingDate,category,categoryDiscount}= req.body

        const offerCategory = new CategoryOffer({
            name:name,
            startingDate:startingDate,
            endingDate:endingDate,
            categoryOffer:{category:category,discount:categoryDiscount}
        })
        await offerCategory.save();
        console.log(offerCategory,"offerCate......")

        res.redirect("/admin/categoryOffer");

    } catch (error) {
        console.log(error.message)
    }
}