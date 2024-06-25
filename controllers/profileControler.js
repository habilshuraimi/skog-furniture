import Address from "../models/addressModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js"

export const loadProfile = async (req, res) => {
  try {
    const id = req.session.user;
    const user = await User.findById(id);
    const addressDoc = await Address.findOne({ user: id });
    const orders = await Order.find({ user: id })
    res.render("profile", {
      user: user,
      addresses: addressDoc ? addressDoc.addresses : [],
      orders:orders
    });
  } catch (error) {
    console.log(error);
  }
};

export const logout = (req, res) => {
  req.session.destroy;
  res.redirect("/login");
};

export const loadAddAddress = (req, res) => {
  res.render("addAddress");
};

export const saveAddress = async (req, res) => {
  try {
    const id = req.session.user;
    // userP in this P stands for work of a profile load etc.....
    const {
      addressType,
      name,
      mobile,
      house,
      area,
      landmark,
      pincode,
      city,
      state,
    } = req.body;
    const user = req.session.user;

    const newAddress = {
      addressType: addressType,
      name: name,
      mobile: mobile,
      HouseNo: house,
      Street: area,
      Landmark: landmark,
      pincode: pincode,
      city: city,
      State: state,
    };

    // Find the existing address document for the user
    let addressDoc = await Address.findOne({ user: user });

    if (!addressDoc) {
      // If no address document exists, create a new one
      addressDoc = new Address({
        user: user,
        addresses: [newAddress],
      });
    } else {
      // If an address document exists, push the new address to the addresses array
      if (addressDoc.addresses.length >= 3) {
        throw new Error("You can have a maximum of 3 addresses.");
      }
      addressDoc.addresses.push(newAddress);
    }
    console.log(newAddress, "newAddress");
    console.log(addressDoc, "addressDoc");

    await addressDoc.save();
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
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

