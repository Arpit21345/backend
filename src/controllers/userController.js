import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from fronted 
    // validation - not empty
    // check if unique username or email
    // chek for images
    // upload to cloudinary
    // create user object - create entru in db
    //  remove pass and refresh taken filed from reonse 
    // check for user creation 
    // return res

    const {fullName, email, username, password} = req.body
    console.log("email:",email);
//   if(fullName ===""){
//     throw new ApiError(400,"fullname is required")
//   }

    if (
        [fullName, email, username, password].some((field) =>
        field?.trim() === "")
        )
    {
        throw new ApiError(400,"All firlds are required")
    }
    // Check if the email is valid
    const isValidEmail = email.includes('@') && email.includes('.');
    if (!isValidEmail) {
        throw new ApiError(400, "Invalid email address");
    }
    // operators 
    const existedUser= User.findOne({
        $or:[{username},{ email }]
     })
     if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
     }
     const avatarLocalPath = req.files?.avatar[0]?.path;
     const coverImageLocalPath = req.files?.coverImage[0]?.path;
     if (!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")

     }
     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary
     (coverImageLocalPath)
     if (!avatar) {
        throw new ApiError(400, "Avatar file is required")

     }
     User.create(
        {
          Fullname,
          avatar: avatar.url,
          coverImage :coverImage?.url || "",
          email,
          password,
          username: username.toLowerCase

        }
     )
     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
     )
     if(!createdUser){
        throw new ApiError(500,"something went wrong with registering the user")
     }
      return res.status (201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
      )


});
export default registerUser;