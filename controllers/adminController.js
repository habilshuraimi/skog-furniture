import User from "../models/userModel.js"

import bcrypt from "bcrypt";

export const loadAdminHome = (req,res)=>{
    res.render('adminHome')
}


export const adminLoginLoad = (req,res)=>{
   
    res.render("adminLogin") 
}



export const verifyAdminLogin = async(req,res)=>{
    const {email,password}=req.body
  const userData = await User.findOne({$and:[{email},{isAdmin:true}]});
  console.log(userData,"ud");   
  if (userData) {
    const isMatch = bcrypt.compare(password, userData.password);

    if (isMatch) {
      req.session.Admin = userData._id;
      res.redirect("/admin/adminHome");
    } else {
      res.render("adminLogin", { error: "password does not match" });
    }
  } else {
    return res.render("adminLogin", { error: "admin Not found" });
  }
};

export const adminlogOut = (req,res)=>{
    req.session.destroy();

    res.redirect("/admin/adminLogin");

}

