import Coupon from "../models/couponModel.js";
import Cart from "../models/cartModel.js";
import User from "../models/userModel.js"

export const loadCoupon = async (req, res) => {
  const couponData = await Coupon.find({});

  res.render("coupon", { couponData });
};

//function for  loading add   coupon page
export const loadAddCoupon = async (req, res) => {
  res.render("couponAdd");
};

// function for saving a coupon
export const saveCoupon = async (req, res) => {
  const {
    name,
    code,
    description,
    startDate,
    discountPercentage,
    minPurchaseAmount,
    maxPurchaseAmount,
    expirationDate,
    maxUsers,
  } = req.body;

  const coupon = new Coupon({
    name: name,
    couponCode: code,
    description: description,
    startDate: startDate,
    EndDate: expirationDate,
    minimumAmount: minPurchaseAmount,
    maximumAmount: maxPurchaseAmount,
    discount: discountPercentage,
    users: maxUsers,
    usersUsed:[]
  });
  await coupon.save();

  console.log(coupon);

  res.redirect("/admin/coupon");
};


export const toggleCoupon = async (req, res) => {
  try {
      const { couponId, isActive } = req.body
      const updateCoupon = await Coupon.findByIdAndUpdate(couponId, { isActive: isActive })
      updateCoupon.save()
      res.status(200).json({ success: true, message: "Coupon status toggled successfully." })
  } catch (error) {
      console.log("Error while toggling the button", error.message)
      res.status(500).json({ success: false, message: "Failed to toggle coupon status." });
  }
}


//                              from here the controllers are for use side       



export const applyCoupon = async (req, res) => {
  try {
    const userId = req.session.user;
    const { couponCode } = req.body;

    const cart = await Cart.findOne({ owner: userId }).populate('items.productId');
    const coupon = await Coupon.findOne({ couponCode });

    if (!coupon) {
      return res.status(400).json({ status: "invalid", message: "Coupon code is invalid" });
    }

    const match = coupon.usersUsed.some(id => id.toString() === userId);
    if (match) {
      return res.status(400).json({ message: "Coupon has already been used" });
    }

    if (cart.billTotal >= coupon.minimumAmount && cart.billTotal <= coupon.maximumAmount) {
      const discountAmount = (cart.billTotal / 100) * coupon.discount;
      const newBillTotal = cart.billTotal - discountAmount;

      cart.billTotal = newBillTotal;
      cart.coupon = couponCode;
      coupon.usersUsed.push(userId);

      await coupon.save();
      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Coupon applied successfully",
        discountAmount,
        newBillTotal,
      });
    } else {
      return res.status(400).json({ status: "Limit", message: "Coupon cannot be applied due to limit restrictions" });
    }
  } catch (error) {
    console.log(`Error in apply coupon post: ${error.message}`);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



