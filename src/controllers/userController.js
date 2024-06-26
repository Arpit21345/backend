import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken';
import { ApiResponse } from "../utils/ApiResponse.js";
// import { TokenExpiredError } from "jsonwebtoken";
import router from "../routes/user.routes.js";

const genrateAccessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId)
        // console.log("helllo error");

        const accessToken = user.genrateAccessToken()
        // console.log("ok error");

        const refreshToken = user.genrateRefreshToken()
        // console.log("helllo");

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

    } catch(error){
          throw new ApiError(500, "Something went wrong while genrating refresh and access token")
    }
}



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
    // console.log("email:",email);
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
    const existedUser= await User.findOne({
        $or:[{username},{ email }]
     })
     if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
     }
     const avatarLocalPath = req.files?.avatar?.[0]?.path;
    //  const coverImageLocalPath = req.files?.coverImage[0]?.path;
     let coverImageLocalPath;
     if (req.files && Array.isArray(req.files.coverImage) &&
     req.files.coverImage.length>0) {
        coverImageLocalPath = req.files.coverImage[0].path
     }
     if (!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")

     }
     
     const avatar = await uploadOnCloudinary(avatarLocalPath);
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);
     if (!avatar || !coverImage) {
         throw new ApiError(400, "Failed to upload avatar or cover image");
     }
     
     const avatarUrl = avatar.url;
     const coverImageUrl = coverImage.url;
     
    const user = await User.create(
        {
          fullName,
          avatar: avatarUrl,
          coverImage :coverImageUrl || "",
          email,
          password,
          username: username.toLowerCase()

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
const loginUser = asyncHandler(async(req,res)=>{

    //    req body -> data 
    //    username or email
    //    find the user
    //    password chek
    //    accsess the refresh TokenExpiredError
    //    send cooki 
    const {email, username, password} = req.body
    
    console.log(email);
    
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
     const user=await User.findOne({
        $or:[({username},{email})]
     })
     if(!user){
        throw new ApiError(404,"User does not exist")

     }
     const isPasswordValid = await user.isPasswordCorrect(password)
     if(!isPasswordValid){
        throw new ApiError(401,"invalid user credntials")

     }
     const {accessToken, refreshToken} = await genrateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

     const options = {
        httpOnly: true,
        secure:true

     }
    
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
         new ApiResponse(
             200, 
             {
                 user: loggedInUser, accessToken, refreshToken
             },
             "User logged In Successfully"
         )
     )
 
 })
 const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken:undefined 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})
const refreshAccessToken = asyncHandler(async (req,res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

    if (!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")

    }
   try {
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
     const user = await User.findById(decoderToken?._id)
      if(!user){
         throw new ApiError(401, "Invalid refresh token")
      }
      if (incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"Refresh token is expired or used")
      }
      const options = {
         httpOnly: true,
         secure: true
      }
      const {accessToken,newrefreshToken} = await genrateAccessAndRefreshToken(user._id)
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
         new ApiResponse(
             200,
             {accessToken, refreshToken: newrefreshToken},
             "Access token refereshed"
         )
      )
 
   } catch (error) {
     throw new ApiError(401, error?.message || "invalid refresh token")

   }
      
})
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    // u can add one more as confirm password and then an if else condition to check wether the new password and confirm password is same or not

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")

    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))


})
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200, req.user,"current user fetched successfully")
})
const updateAccountDetails = asyncHandler(async(req,res) =>{

    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All feilds are required")

    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email: email
            }
        },
        {new: true}

    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponce(200, user,"Account details updated succcessfuly"))
})
const updateUserAvatar = asyncHandler(async(res,req)=> {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is missing")
    }
        const avatar = await uploadOnCloudinary(avatarLocalPath)

        if(!avatar.url) {
            throw new ApiError(400, "Error while uploading on avatar")
        
    }
   const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "avatar image updated successful")
    )

})
const updateUserCoverImage = asyncHandler(async(res,req)=> {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"cover Image file is missing")
    }
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!coverImage.url) {
            throw new ApiError(400, "Error while uploading on avatar")
        
    }
   const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successful")
    )

})
const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})
const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory


}