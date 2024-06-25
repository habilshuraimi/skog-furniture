import Category from "../models/categoryModel.js"
import Product from "../models/productModel.js"
import multer from "multer"
  
const upload = multer({ dest: 'uploads/' });

export const loadproducts = async(req,res)=>{
    const category = await Category.find({})
    const product = await Product.find({})
    res.render('products',{category:category,product:product})
}

export const loadAddProduct = async(req,res)=>{
    const category = await Category.find({})
    const product = await Product.find({})
    res.render("productAdd",{category:category,product:product})
}

export const saveProduct = async(req,res)=>{
    try {
        const {name,description,price,discountPrice,stock,category} = req.body
    const images = req.files?req.files.map(file=>file.filename):[];
const product = new Product({
        name:name,
        description:description,
        price:price,
        stock:stock,
        discountPrice:discountPrice,
        images:images,
        category:category

    }) 
    const productData = await product.save()
    
    res.redirect('/admin/products')
    } catch (error) {
        console.log(error)
        
    }
}

    //rendering the page for editing
    export const editProductload = async (req, res) => {
        try {
            const id = req.query.id;
            const product = await Product.findById({ _id: id });
            
            if (!product) {
                return res.status(404).send('Product not found');
            }
    
            const category = await Category.find();
            
            res.render("productEdit", {
                proData: product,
                category: category
            });
            console.log(product.stock)
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    };
    

    // to save the changes in edit
    export const editProduct = async (req, res) => {
        const id = req.query.id;
        const { name, description, price, discountPrice, stock, category } = req.body;
        const images = req.files ? req.files.map(file => file.filename) : [];
    
        try {
            // Perform your update operation here
            const product = await Product.findByIdAndUpdate(id, {
                name: name,
                description: description,
                price: price,
                stock: stock,
                discountPrice: discountPrice,
                images: images,
                category: category
            });
    
            // Redirect upon successful update
            res.redirect('/admin/products');
        } catch (error) {
            // Handle errors appropriately
            console.error('Error updating product:', error);
            res.status(500).send('Error updating product.');
        }
    };