import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongo_url = process.env.MONGO_URI || ""
    const conn = await mongoose.connect(mongo_url);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error:any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
