import express from 'express';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import dbConnection from './Config/dbConnection.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5034;

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, () => {
    dbConnection();
    console.log(`Server running at http://localhost:${PORT}`);
});
