import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const dbConnection = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongoose) => mongoose);
    }

    cached.conn = await cached.promise;
    console.log("MongoDB connected ✅");
    return cached.conn;
};

export default dbConnection;
