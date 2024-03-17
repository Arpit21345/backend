import mongoose from "mongoose";
import { DB_NAME } from "../constrants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        // console.log(connectionInstance);
    } catch (error) {
        console.log("MONGODB CONNECTION error", error);
        process.exit(1);
    }
}

export default connectDB;

