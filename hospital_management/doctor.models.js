import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
    
},
salary:{
    type:String,
    required:true

},
qualification:{
    type:String,
    required:true

},
experinceInYears: {
    type: Number,
    default:0
},
worksInHospital:{
     type:mongoose.Schema.types.ObjectId,
     ref: 'hospital',
},
    
},{timestamps:true})

export const Doctor = mongoose.model("Doctor",doctorSchema);