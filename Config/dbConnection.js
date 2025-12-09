import mongoose from "mongoose";

const URI = process.env.MONGO_URI;

let isConnected = false;

const dbConnection = async () => {
    if (isConnected) return;

    try {
        const db = await mongoose.connect(URI);
        isConnected = db.connections[0].readyState;
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB error:", error);
        throw error;
    }
};

export default dbConnection;
