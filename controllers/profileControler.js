import Address from "../models/addressModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js" 
import Wallet from "../models/walletModel.js";
import Cart from "../models/cartModel.js";

export const loadProfile = async (req, res) => {
  try {
    const id = req.session.user;
    const user = await User.findById(id);
    const addressDoc = await Address.findOne({ user: id });
    const orders = await Order.find({ user: id }).populate({path:'items.productId',model:'Product'}).sort({ createdAt: -1 });;
    const wallet = await Wallet.findOne({user:id}).populate("orders")||null
    const cartProduct = await Cart.findOne({ owner: id }).populate('items.productId');
    console.log(orders)

  
    res.render("profile", {
      user: user,
      addresses: addressDoc ? addressDoc.addresses : [],
      orders:orders,
      wallet:wallet,
      cartProduct
    });
  } catch (error) {
    console.log(error);
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error in logging out");
    } else {
      res.redirect("/login");
    }
  });
};

export const loadAddAddress = (req, res) => {
  res.render("addAddress");
};

export const saveAddress = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(400).send("User not logged in");
    }

    const {
      addressType,
      name,
      mobile,
      houseNo,
      street,
      landmark,
      pincode,
      city,
      district,
      state,
    } = req.body;

    // Validate that all required fields are present
    if (
      !addressType ||
      !name ||
      !mobile ||
      !houseNo ||
      !street ||
      !landmark ||
      !pincode ||
      !city ||
      !district||
      !state
    ) {
      return res.status(400).send("All fields are required");
    }

    const newAddress = {
      addressType,
      name,
      mobile,
      houseNo,
      street,
      landmark,
      pincode,
      city,
      district,
      state,
    };

    let addressDoc = await Address.findOne({ user });

    if (!addressDoc) {
      addressDoc = new Address({
        user,
        addresses: [newAddress],
      });
    } else {
      if (addressDoc.addresses.length >= 3) {
        return res.status(400).send("You can have a maximum of 3 addresses."); 
      }
      addressDoc.addresses.push(newAddress);
    }

    console.log("Saving address:", newAddress);
    console.log("Address document before save:", addressDoc);

    await addressDoc.save();

    console.log("Address document after save:", addressDoc);

    res.redirect("/profile");
  } catch (error) {
    console.error("Error saving address:", error.stack);
    res.status(500).send("Internal Server Error");
  }
};


//save edited addres
export const editAddress = async (req, res) => {
  try {
    const { houseNo, street, landmark, pincode, city, state, addressType } = req.body;
    const id = req.query.id;

    const edited = await Address.findOneAndUpdate(
      { "addresses._id": id },
      {
        $set: {
          "addresses.$.addressType": addressType,
          "addresses.$.houseNo": houseNo,
          "addresses.$.landmark": landmark,
          "addresses.$.pincode": pincode,
          "addresses.$.city": city,
          "addresses.$.state": state,
        }
      },
      { new: true }
    );

    res.redirect("/profile");
  } catch (error) {
    console.log(error);
  }
};

