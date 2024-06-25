import User from "../models/userModel.js"
export const adminLogged = async (req,res,next)=>  {

    const user = await User.findOne({_id:req.session.Admin});
    
    req.session.Admin && user.isAdmin === true ? next() :  res.render("adminLogin")
    }

   
        
    