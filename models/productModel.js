import mongoose from 'mongoose'
const objectId = mongoose.Schema.Types.ObjectId;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: objectId,
        required: true,
    },
    price: {
        type: Number,
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
        type: Number,
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