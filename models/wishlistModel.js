import mongoose from "mongoose";

const ObjectId=mongoose.Schema.Types.ObjectId ;

const wishListSchema=new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    product:[{
        type:ObjectId,
        ref:'Product',
        required:true
    }]
})
const wishList=mongoose.model('WishList',wishListSchema);
export default wishList