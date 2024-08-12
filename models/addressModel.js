import mongoose from "mongoose";
const ObjectID = mongoose.Schema.Types.ObjectId;

const addressSchema = new mongoose.Schema({
  user: {
    type: ObjectID,
    ref: "user",
    required: true,
  },
  addresses: [
    {
      addressType: {
        type: String, // This will store the address type, e.g., 'home' or 'work'
        required: true,
        enum: ["home", "work", "temp"], // Define the allowed values for address type
      },
      name: {
        type: String,
        required: true,
      },
      mobile: {
        type: String,
        required: true,
      },
      houseNo: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      landmark: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
    },
  ],
});

addressSchema.path("addresses").validate(function (value) {
  return value.length <= 3;
}, "You can have a maximum of 3 addresses.");

const Address = mongoose.model("Address", addressSchema);
export default Address;

