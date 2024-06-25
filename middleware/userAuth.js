import User from "../models/userModel.js";


export const isLogged = async(req, res, next) =>{
    const user = await User.findOne({_id:req.session.user});
    req.session.user &&  user.isAdmin === false ? next() : res.render("login");
} 

