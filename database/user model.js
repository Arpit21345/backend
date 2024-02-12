import mongoose from "mongoose";

 const userSchema = new mongoose.Schema({
  username:{
    type:String,
    required:true,
    unique:true,
  },
  email: {
    type:String,
    required:true,
    unique:true,
  },
  password:{
    type:String,
    required:true,
  }
 }, {timestamp:true})
 export const userData = mongoose.model("userData",userSchema);