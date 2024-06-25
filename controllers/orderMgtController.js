import Order from "../models/orderModel.js"


export const orders = async (req,res)=>{
    const order = await Order.find()
    res.render("orders",{order})
}

export const orderDetails = async(req,res)=>{
    const id = req.query.id
    const orders = await Order.findById(id)
    console.log(orders)


    res.render("orderDetails",{orders})
    
}