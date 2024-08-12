import mongoose from "mongoose";

const ObjectId=mongoose.Schema.Types.ObjectId ;

const whishListSchema=new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    product:[{
        type:ObjectId,
        ref:'Products',
        required:true
    }]
})
const whishList=mongoose.model('WhishList',whishListSchema);
export default whishList