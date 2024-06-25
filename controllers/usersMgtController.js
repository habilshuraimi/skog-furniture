import User from "../models/userModel.js"

export const loadUsers = async(req,res)=>{
    const user = await User.find({isAdmin:false})
    res.render('userslist',{users:user})
}

export const blockUser = async(req,res)=>{
    try{
        const userId = req.query.id    
        await User.findByIdAndUpdate(userId,{ isBlocked: true });
        res.redirect('/admin/users')
    }catch(error){
        console.log(error)
    }
    
}
export const unBlockUser = async (req,res)=>{
    try {
        const userId = req.query.id
    await User.findByIdAndUpdate(userId,{isBlocked:false});  
    res.redirect('/admin/users')

        
    } catch (error) {
        console.log(error)
    }
}