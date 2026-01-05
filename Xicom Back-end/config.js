import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config()
export const connectToMongoDB = async () => {
    try {
    await mongoose.connect(process.env.VITE_XICOM_ASSIGMENT_MONGO_DB);
    console.log('Successfully connected');
    } catch (error) {
        console.log(error);
    }
}

