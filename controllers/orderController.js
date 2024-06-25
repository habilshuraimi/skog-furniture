import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import Address from "../models/addressModel.js";
import randomstring from "randomstring";






async function generateUniqueOrderID(){
    const randomPart= randomstring.generate({
        length:6,
        charset:'numeric'
    })
  
    const currentDate = new Date()
  
    const datePart = currentDate.toISOString().slice(0,10).replace(/-/g,"");
  
    const orderID = ` ID_${randomPart}${datePart}`
  
    return orderID
  }
  
  
      export const order = async(req,res)=>{
        try {
            const id= req.session.user
            const {paymentOption,addressType}= req.body;
    
           if(paymentOption==null){
                return res.status(400).json({message:'payment error'});
            }
            if(!addressType){
                return res.status(400)
            }
    
            const user = await User.findById(id)
    
            const cart = await Cart.findOne({owner:req.session.user}).populate({path:'items.productId',model:'Product'})
    
            if(!cart){
                return res.status(400).json({message:"Cart not found"})
            }
    
            const orderAddress = await Address.findOne({user:user._id})
            if(!orderAddress){
                return res.status(400).json({message:"Address not found"})
            }
    
            const addressdetails = orderAddress.addresses.find((item)=>item.addressType===addressType)
    
            if(!addressdetails){
                console.log("error 1")
                return res.status(400).json({
                    
                    message:"Invalid address ID"
                })
            }
    
            const selectedItems = cart.items
    
            for(const item of selectedItems){
                const product = await Product.findOne({_id:item.productId})
    
                if(product.stock===0){
                    console.log("error 2")
                    return res.status(400).json({
                        message:"product out of stock"
                    })
                }
    
                if(product.stock>=item.quantity){
                    product.stock-=item.quantity
    
                    await product.save()
                }else{
    
                    console.log("Product not found..............")
                }
            }
    
            const order_id = await generateUniqueOrderID()
    
            const orderData = new Order({
                user:user._id,
                cart:cart._id,
                billTotal:cart.billTotal, 
                oId:order_id,
                paymentStatus:"Success",
                paymentMethod:paymentOption,
                deliveryAddress:addressdetails,
                coupon:cart.coupon,
                discountPrice:cart.discountPrice
            });
    
            for(const item of selectedItems){
                orderData.items.push({
                    productId:item.productId._id,
                    image:item.productId.images[0],
                    name:item.productId.name,
                    productPrice:item.productId.price,
                    quantity:item.quantity,
                    price:item.price
                })
            }
            console.log(orderData._id,'./././././././././././././/./././././/./');
            
            
             await orderData.save();
     
             cart.items = []
             await cart.save()
    

            res.status(200).json({order_id})
    
        }   catch (error) {
            console.log('Post checkout error:', error.message);
            res.status(500).json({ message: "Internal server error" });
        
      
        }
  }


  export const confirmPage = (req,res)=>{
    const orderId = req.query.id;

    res.render("orderSuccess",{orderId})

  }