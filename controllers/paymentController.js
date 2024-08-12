import dotenv from "dotenv";
dotenv.config();
import Razorpay from "razorpay";
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_PASSWORD,
  });

  // function to create an order
  export const createOrder = async(req,res)=>{
    const options = {
        amount: req.body.amount * 100, // Amount in paise
        currency: 'INR',
        receipt: 'receipt#1',
      };

      try {
        const order = await razorpay.orders.create(options);
        // console.log('order in razxoe',order);
        // if(order){
        //   res.redirect('/order');
        // }
        res.json(order);
      } catch (error) {
        res.status(500).send(error);
      }

  }
  //function tp verify payment
  export const verifyPayment = async(req,res)=>{
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_PASSWORD);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest('hex');
  console.log(generatedSignature,"............................................",razorpay_signature)

  if (generatedSignature === razorpay_signature) {
    res.send('Payment verified successfully');
  } else {
    res.json({razorpay_order_id}).send('Payment failed order created',);
  }
        
    } catch (error) {
        console.log(error)
    }

  }