import express from "express"
const userRoute = express()

userRoute.use(express.static('public'))

import { verified } from "../middleware/emailverify.js"
import { isLogged } from "../middleware/userAuth.js"
import { loadEmail, loadHome, loadOtp,   loadSignup, loadlogin,resendOtp, saveUser, verifyLogin, verifyOtp } from "../controllers/userController.js"
import {  addToCart, adding, loadCart,  removing,  } from "../controllers/cartController.js"
import { loadProductDetails, loadShop } from "../controllers/shopController.js"
import { loadCheckout } from "../controllers/checkOutController.js"
import { editAddress, loadAddAddress, loadProfile, logout, saveAddress } from "../controllers/profileControler.js"
import { confirmPage, order } from "../controllers/orderController.js"

userRoute.set('view engine','ejs')
userRoute.set('views','./views/user')

userRoute.get('/',loadHome)
userRoute.get('/shop',loadShop)
userRoute.get('/productDetails',loadProductDetails)
userRoute.get('/cart',isLogged,loadCart)
userRoute.get('/addCart',isLogged,addToCart)
userRoute.get('/checkout',isLogged,loadCheckout)
userRoute.post('/increment',adding)
userRoute.post('/decrement',removing)
userRoute.post('/order',order)

userRoute.get("/confirmOrder",confirmPage)


userRoute.get('/email',loadEmail)   
userRoute.post('/otp',loadOtp)
userRoute.post('/resendOtp',resendOtp)
userRoute.post('/verify',verifyOtp)
userRoute.get('/signup',verified,loadSignup)

userRoute.post('/register',saveUser)
userRoute.post('/save',saveUser)

userRoute.get('/login',loadlogin)
userRoute.post('/login',verifyLogin)



userRoute.get('/profile',isLogged,loadProfile)
userRoute.get('/addAddress',isLogged,loadAddAddress)
userRoute.post('/addAddress',isLogged,saveAddress)
userRoute.post('/editAddress',editAddress)
userRoute.get('/logout',logout)


export default userRoute