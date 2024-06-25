import User from "../models/userModel.js"
import Cart from "../models/cartModel.js"
import Address from "../models/addressModel.js"

export const loadCheckout = async (req, res) => {
    try {
        const id = req.session.user;
        const user = await User.findById({ _id: id });

        
        const cartData = await Cart.findOne({ owner: user }).populate({
            path: "items.productId",
            model: "Product",
        });

        const addressData = await Address.findOne({ user: id });
        const addresses = addressData ? addressData.addresses : [];

        res.render('checkOut', { user,  cartData, addresses });

    } catch (error) {
        console.log(error.message);
    }
};

