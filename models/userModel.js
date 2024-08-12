import mongoose from "mongoose"
import { token } from "morgan";

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
    token :{
        type :String,
        default: '',
    },
   

});

const User =mongoose.model('User',userSchema)

export default User;