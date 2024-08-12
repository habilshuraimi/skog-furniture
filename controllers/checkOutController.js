import User from "../models/userModel.js"
import Cart from "../models/cartModel.js"
import Address from "../models/addressModel.js"

import Coupon from "../models/couponModel.js";

export const loadCheckout = async (req, res) => {
    try {
        let id 
        if(req.session.passport){
            id=req.session.passport.user._id
        }else{
             id = req.session.user;

        }
        const user = await User.findById({ _id: id });

        const cartData = await Cart.findOne({ owner: user }).populate({
            path: "items.productId",
            model: "Product",
        });
        console.log(cartData,"cerrrrtttt")

        const addressData = await Address.findOne({ user: id });
        const addresses = addressData ? addressData.addresses : [];

        let discountPercent = 0;
        if (req.query.couponCode) {
            const coupon = await Coupon.findOne({ couponCode: req.query.couponCode, isActive: true });
            if (coupon) {
                const currentDate = new Date().toISOString().split('T')[0];
                if (currentDate >= coupon.startDate && currentDate <= coupon.EndDate) {
                    discountPercent = coupon.discount;
                }
            }
        }

        res.render('checkOut', { user, cartData, addresses, discountPercent });

    } catch (error) {
        console.log(error.message);
    }
};


