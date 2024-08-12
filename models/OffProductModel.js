import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId

const productOfferSchema = new mongoose.Schema({
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
    productOfffer: {
        product: {
            type: ObjectId,
            ref: "Product"
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

productOfferSchema.pre("save", function (next) {
    const currentDate = new Date();
    if (currentDate > this.endingDate) {
        this.productOffer.offerStatus = false;
    }
    next();
});

const ProductOffer = mongoose.model("productOffer", productOfferSchema)

export default ProductOffer
