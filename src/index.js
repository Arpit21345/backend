// require('dotenv').config({path: './env'})
import mongoose from "mongoose";
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})



connectDB()
.then(()=>{
    application.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO bd connection failed !!!", err);
})










/*
import express from "express"
const app = express()
(async () =>{
    try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error",(error)=>{
        console.log("ERR:",ERROR);
        throw error
    })
    app.listen(process.env.PORT,()=>{
        console.log(`app is listening at${PORT}  
         http://localhoat:${PORT}`);
    })
    } catch (error) {
        console.error("ERROR:", error)
    }
})()
*/