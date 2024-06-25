import Category from "../models/categoryModel.js"

    // loading category page
export const loadCategories = async(req,res)=>{
    const category = await Category.find({})
    res.render('categories',{category})
}

    // saving a new category-
export const saveCategories = async(req,res)=>{
    try {
        const name = req.body.name
    const existingCatName = await Category.findOne({name:name.toLowerCase()})
    if(existingCatName){
        const category = await Category.find({})
        res.render('categories',{category:category,message:"category name already exists"})
        
    }else{
        await new Category({
            name:req.body.name.toLowerCase(),
            description:req.body.description
        }).save()
    
    res.redirect('/admin/categories')
    }

    } catch (error) {
        console.log(error)
        
    }    
}

    // editing a category
export const editCategoryload = async(req,res)=>{
    const id = req.query.id
    const data = await Category.findById(id)
   res.render('editCategories',{id:id,data:data})
   
}    


    // saving changes in editing
export const editCategory = async(req,res)=>{
    try {
        const id = req.query.id
        await Category.findByIdAndUpdate({_id:id},{$set:{name:req.body.name,description:req.body.description}})

        res.redirect('/admin/categories')
        
    } catch (error) {
        console.log(error);
        
    }
}

    // to delete and restore categories
export const deleteCategory = async(req,res)=>{
    try {

        const id = req.query.id
        console.log(id)
        const category = await Category.findById(id)
        if(category.isActive === true){
            await Category.findByIdAndUpdate(id,{isActive:false})
        }else{
            await Category.findByIdAndUpdate(id,{isActive:true})
        }
        res.redirect('/admin/categories')
    } catch (error) {
        console.log(error);
        
    }
}