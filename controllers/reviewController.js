import Review from "../models/reviewModel.js";

export const rateProduct=async(req,res)=>{
    try {
  
      const {productId,rating,reviewText}=req.body;
      console.log(req.body,"bodddd")
      let data=await Review.findOne({user:req.session.user,product:productId})
      if(data==null){
          data=new Review({
            user:req.session.user,
            product:productId,
            rating:rating,
            reviewText:reviewText
          })    
      }
      data.rating=rating
      data.reviewText=reviewText
      await data.save();
   return res.status(200).json({message:'response submitted'})
    } catch (error) {
    return res.status(400).json(error) 
    }
  }

