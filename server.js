import dotenv from "dotenv";
import cloudinary from "cloudinary";
import app from "./app.js";
import dbConnection from "./Config/dbConnection.js";

dotenv.config();

dbConnection();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default app;
