import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discountPrice: {
        type: String,
        required: true 
    },
    isActive: {
        type: Boolean,
        default: true
    },
    images:[{
        type:String
    }]
})

const Product = mongoose.model('Product',productSchema)
 export default Product