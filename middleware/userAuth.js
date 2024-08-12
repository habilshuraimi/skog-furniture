import User from "../models/userModel.js";

export const isLogged = async(req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    const user = await User.findOne({_id: req.session.user});
    if (user && user.isAdmin === false) {
        return next();
    } else {
        return res.redirect("/login");
    }
};

export const islogOut  = async(req,res,next) => req.session.user ? res.redirect("/login"): next() 