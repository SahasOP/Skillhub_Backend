import mongoose from "mongoose";


let isConnected = false;

const dbConnection = async () => {
    if (isConnected) return;

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB error:", error);
        throw error;
    }
};

export default dbConnection;
