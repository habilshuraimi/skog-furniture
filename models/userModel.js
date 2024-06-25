import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
       
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
      
    },
    isBlocked:{
        type:Boolean,
        default:false

    },
    isAdmin:{
        type:Boolean,
        default:false
    },
   

});

const User =mongoose.model('User',userSchema)

export default User;