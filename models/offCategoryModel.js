import mongoose from "mongoose"
const ObjectId= mongoose.Schema.Types.ObjectId

const categoryOfferScehma = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    startingDate: {
        type: Date,
        require: true
    },
    endingDate: {
        type: Date,
        require: true
    },
    categoryOffer: {
        category: {
            type: ObjectId,
            ref: "Category"
        },
        discount: {
            type: Number
        }
    },

    is_Active: {
        type: Boolean,
        default: true
    }
})

categoryOfferScehma.pre("save", function (next) {
    const currentDate = new Date()
    if (currentDate > this.endingDate) {
        this.categoryOffer.offerStatus = false
    }
    next()
})

const CategoryOffer = mongoose.model("categoryOffer", categoryOfferScehma)

export default CategoryOffer
