import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// ensure env variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-chinese';
        console.log('Connecting to MongoDB at:', mongoUri);
        const conn = await mongoose.connect(mongoUri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
