import mongoose from "mongoose";
import bcrypt from "bcrypt"
import { Jwt } from "jsonwebtoken";


 const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index: true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    
    },
    fullName:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        index: true
    },
    avatar:{
        type:String, //cloud service url
        required:true,
       
    },
    coverImage: {
        type:String,//cloud url
    },
    waatchHistory: [
        { type: mongoose.Schema.types.ObjectId,
        ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true,'Password is required'] 
    },
    refreshToken: {
        type:String
    },

       
 },{timestamps:true})

 userSchema.pre("save", async function (next){
    if(!this.Modified("password")) return next()
    this.password = bcrypt.hash(this.password,10)
    next()
 })
 userSchema.methods.isPasswordCorrect = async function (password){
   return await bcrypt.compare(password, this.password)
 }
userSchema.methods.genrateAccessToken = function(){
     return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username:this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY

        }
    )
}
userSchema.methods.genrateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
          
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_SECRET

        }
    )
}

 export const User = mongoose.model("User",userSchema)