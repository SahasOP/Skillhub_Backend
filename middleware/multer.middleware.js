import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".webp", ".png", ".mp4", ".pdf"].includes(ext)) {
        return cb(new Error(`Unsupported file type: ${ext}`), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter,
});

export default upload;
