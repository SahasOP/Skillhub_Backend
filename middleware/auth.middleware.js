import AppError from "../utils/AppError.js";
import jwt from "jsonwebtoken";

export const isLoggedIn = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return next(new AppError("Authentication required", 401));
        }

        const userDetails = jwt.verify(
            token,
            "ua066B9lGebj243fy2GFQ1NkMMVRaEMemsrQ7zBrEXE="
        );

        req.user = userDetails;
        next();
    } catch (error) {
        console.log(error);
        return next(new AppError("Invalid or expired token", 401));
    }
};
export const isTeacher = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return next(new AppError("Authentication required", 401));
        }

        const userDetails = jwt.verify(
            token,
            "ua066B9lGebj243fy2GFQ1NkMMVRaEMemsrQ7zBrEXE="
        );

        if (userDetails.role !== "teacher") {
            return next(new AppError("Access denied: Not a teacher", 403));
        }

        req.user = userDetails;
        next();
    } catch (error) {
        return next(new AppError("Invalid or expired token", 401));
    }
};


