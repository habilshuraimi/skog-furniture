import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import Randomstring from "randomstring";


// function to load home
export const loadHome = async (req, res) => {
  if (req.session.passport) {
    req.session.user = req.session.passport.user;
  }
  const owner = req.session.user;
  const cartProduct = await Cart.findOne({ owner: owner }).populate("items.productId");

  res.render("home", { cartProduct });
};

// functionn  to load email page
export const loadEmail = (req, res) => {
  res.render("email");
};
  // function to load sign up page
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

// Render login page
export const loadlogin = (req, res) => {
  res.render("login");
};

// Verify login credentials
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
      res.render("login", { error: "Password does not match" });
    }
  } else {
    return res.render("login", { error: "User not found" });
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

// function to generate an otp
const generateOtp = async () => {
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const time = Date.now();
  return { otp, time };
};

// this function will send otp
const sendOtp = async (otp, email) => {
  try {
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

    console.log(`OTP sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send OTP to ${email}:`, error);
    throw new Error('Failed to send OTP. Please try again later.');
  }
};
// function to load otp page
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

// function to resend otp
export const resendOtp = async (req, res) => {
  try {
    const { otp, time } = await generateOtp();
    console.log("otp", otp);
    req.session.otp = otp;
    const email = req.session.email; // get email from session

    await sendOtp(otp, email);

    return res.render("otp");
  } catch (error) {
    console.log(error.message);
  }
};

// function to verify the given otp is correct by evaluating
export const verifyOtp = (req, res) => {
  if (req.session.otp === req.body.otp) {
    req.session.verified = true;
    res.redirect("/signup");
  } else {
    res.render("otp", { error: "wrong OTP" });
  }
};

// functions for forgot password starts here

//function to load page
export const forgetLoad = async (req, res) => {
  try {
    res.render("forgetPassword");
  } catch (error) {
    console.log(error.message);
  }
};





const sendResetLink = async (email, token) => {
  try {
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
      subject: "Password Resetting Link",
      text: `Please click the following link to reset your password: http://localhost:9889/forgetPassword?token=${token}&mail=${email}`,
    });

    console.log(`Reset link sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send reset link to ${email}:`, error);
    throw new Error('Failed to send reset link. Please try again later.');
  }
};





export const forgetEmailCheck = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email });

    if (userData) {
      const randomstring = Randomstring.generate(); // Generate a random string as a token
      await User.updateOne({ email }, { $set: { token: randomstring } }); // Save the token to the user's record
      sendResetLink(userData.email, randomstring);
      res.render("forgetPassword", {
        error: "Reset link has been sent to your email.",
      });

    } else {
      res.render("forgetPassword", {
        error: "The email address you entered is not registered.",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("forgetPassword", {
      error: "An error occurred. Please try again later.",
    });
  }
};


export const forgetPage = async (req, res) => {
  try {
    const token = req.query.token;
    const mail = req.query.mail;
    req.session.data = {token,mail}
    
    const user = await User.findOne({ email: mail, token: token });
    if (user) {
      res.render("passwordReset", { mail, token }); // Passing the email and token to the view
    } else {
      res.render("forgetPassword", { error: "Invalid or expired link." });
    }
  } catch (error) {
    console.log(error.message);
    res.render("forgetPassword", { error: "An error occurred. Please try again later." });
  }
};





export const changePassword = async (req, res) => {
  try {
    const mail = req.session.data.mail;
    const token = req.session.data.token;
    const { password, confirmPassword } = req.body;
     const userData = await User.findOne({email:mail})
    if (password !== confirmPassword) {
      return res.render("passwordReset", { error: "Passwords do not match.", email: mail, token });
    }

    
    if(req.query.token === req.session.token){
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.findOneAndUpdate({email:mail},{$set:{password:hashedPassword}},{new: true})
      
      res.render("login", { success: "Password reset successfully. Please log in with your new password." });
    }

    
  } catch (error) {
    console.log(error.message);
    res.render("passwordReset", { error: "An error occurred. Please try again later.", mail: req.query.mail, token: req.query.token });
  }
};
