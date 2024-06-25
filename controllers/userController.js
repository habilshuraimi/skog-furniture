import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";
import Address from "../models/addressModel.js";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";


export const loadHome = async(req, res) => {
  if(req.session.passport){
    req.session.user = req.session.passport.user
  } 
  const owner = req.session.user
  const cartProduct = await Cart.findOne({owner:owner}).populate('items.productId');
  
  res.render("home",{cartProduct});
};





export const loadEmail = (req, res) => {
  res.render("email");
};

export const loadSignup = (req, res) => {
  res.render("signup");
};

//function to hash password
const securePassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.log(error.message);
  }
}; 


export const loadlogin = (req, res) => {
  res.render("login");
};
export const verifyLogin = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userData = await User.findOne({ email });
  if (userData) {
    const isMatch = await bcrypt.compare(password, userData.password); 

    if (isMatch) {
      req.session.user = userData._id;
      res.redirect("/");
    } else {
      res.render("login", { error: "password does not match" });
    }
  } else {
    return res.render("login", { error: "user Not found" });
  }
};

// to save user in data base
export const saveUser = async (req, res) => {
  const { name, number, password } = req.body;

  const email = req.session.email;
  try {
    const hashedPassword = await securePassword(password);
    const newUser = new User({
      name: name,
      email: email,
      mobile: number,
      password: hashedPassword,
    });
    newUser.save();
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

const generateOtp = async () => {
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const time = Date.now();
  return { otp, time };
};

const sendOtp = async (otp, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_MAIL,
      pass: process.env.PASSWORD,
    },
  });
  await transporter.sendMail({
    from: process.env.ADMIN_MAIL,
    to: email,
    subject: "OTP for Verification",
    text: `Your OTP is ${otp}`,
  });
};


export const loadOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.render("email", { error: "already existing user" });
    } else {
      const { otp, time } = await generateOtp();
      console.log("otp", otp);
      req.session.otp = otp;
      const email = req.body.email;

      req.session.email = email;
      await sendOtp(otp, email);

      return res.render("otp");
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const resendOtp = async (req, res) => {
  try {
      const { otp, time } = await generateOtp();
      console.log("otp", otp);
      req.session.otp = otp;
      const email = req.session.email; // get email from session

      await sendOtp(otp, email);

      return res.render('otp');
  
  } catch (error) {
    console.log(error.message);
  }
};

export const verifyOtp = (req, res) => {
  if (req.session.otp === req.body.otp) {
    req.session.verified = true;
    res.redirect("/signup");
  } else {
    res.render("otp", { error: "wrong OTP" });
  }
};




