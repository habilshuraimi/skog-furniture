import User from "../models/userModel.js"
export const isBlocked = async(req,res,next)=>{
    const userId = req.session.user
    const user = await User.findOne({_id:userId})
    if(user && user.isBlocked === true){
        res.render("login",{error:"you account has been  blocked"})
    }else{
        next();
    }
}