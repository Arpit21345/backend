import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    description: {
        required:true,
        type:String,
    },
    name: {
        required:true,
        type:String,
    },
    productImage: {
        type:String,
    },
    price:{
        type:String,
        default: 0,
    },
    stock:{
        default:0,
        type: Number,
    },
    category:{
        type:  mongoose.Schema.Types.ObjectID,
        ref: "Category",
        required: true,
    },
    owner:{
        type:  mongoose.Schema.Types.ObjectID,
        ref:'userData',

    },
},{timestamps:true})

export const Product = mongose.model("Product",productSchema)
