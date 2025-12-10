import User from "../Config/Models/user.model.js";
import AppError from "../utils/AppError.js";
import sendEmail from "../utils/sendMail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";

// Cookie options
const cookieOption = {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ---------- AUTH HANDLERS ----------

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return next(new AppError("All fields are required", 400));
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password)))
            return next(new AppError("Invalid credentials", 401));
        const token = user.generateJWTToken();
        res.cookie("token", token, cookieOption);
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user,
        });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

export const signup = async (req, res, next) => {
    try {
        const { name, email, prn, rollNo, password, role, branch, division, year } = req.body;
        if (
            (role === "student" && (!name || !email || !prn || !rollNo || !password || !role || !branch || !division || !year)) ||
            (role === "teacher" && (!name || !email || !password || !role || !branch))
        ) {
            return next(new AppError("All fields are required", 400));
        }
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return next(new AppError("User already exists. Please log in.", 400));

        const userObj =
            role === "student"
                ? { name, email, prn, rollNo, password, role, branch, division, year }
                : { name, email, password, role, branch };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpToken = bcrypt.hashSync(otp, 10);

        res.cookie("otpToken", otpToken, { httpOnly: true, maxAge: 10 * 60 * 1000 });
        res.cookie("tempUser", userObj, { httpOnly: true });

        await sendEmail(email, "Your OTP", `Your OTP is ${otp}`);

        res.status(200).json({
            success: true,
            message: `OTP sent to ${email}`,
        });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

export const regenerate_otp = async (req, res, next) => {
    try {
        const tempUser = req.cookies?.tempUser;
        if (!tempUser)
            return next(new AppError("No pending user data found. Please sign up first.", 400));
        const { email } = tempUser;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpToken = bcrypt.hashSync(otp, 10);
        res.cookie("otpToken", otpToken, { httpOnly: true, maxAge: 10 * 60 * 1000 });
        await sendEmail(email, "Your Regenerated OTP", `Your new OTP is ${otp}`);
        res.status(200).json({
            success: true,
            message: "A new OTP has been sent to your email.",
        });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

export const validate_otp_email = async (req, res, next) => {
    const { otp } = req.body;
    const otpToken = req.cookies.otpToken;
    const tempUser = req.cookies.tempUser;

    if (!otpToken || !tempUser)
        return next(new AppError("OTP expired or user details missing", 400));

    try {
        if (!bcrypt.compareSync(otp, otpToken))
            return next(new AppError("Invalid OTP", 400));
        const user = await User.create(tempUser);
        if (!user) return next(new AppError("Failed to register user", 500));

        await user.save();
        res.clearCookie("otpToken");
        res.clearCookie("tempUser");
        const token = user.generateJWTToken();
        res.cookie("token", token, cookieOption);
        res.status(200).json({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

export const logout = (req, res) => {
    res.cookie("token", null, { httpOnly: true, secure: true, maxAge: 0 });
    res.status(200).json({
        success: true,
        message: "User logged out successfully",
    });
};

// ---------- PROFILE & CRUD ----------

export const getAllStudents = async (req, res, next) => {
    try {
        const student = await User.find({ role: "student" });
        res.status(200).json({
            success: true,
            message: "All Students fetched",
            student,
        });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

export const getAllTeachers = async (req, res, next) => {
    try {
        const teacher = await User.find({ role: "teacher" });
        res.status(200).json({
            success: true,
            message: "All Teachers fetched",
            teacher,
        });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const id = req.user.id;
        const user = await User.findById(id).lean();
        if (!user) return next(new AppError("User not found", 404));
        res.status(200).json({
            success: true,
            message: `User with ID: ${id}`,
            user,
        });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(new AppError("Email is required", 400));
    try {
        const user = await User.findOne({ email });
        if (!user) return next(new AppError("User not found", 404));
        const resetToken = user.generateResetPasswordToken();
        await user.save();
        const resetPasswordUrl = `http://localhost:5173/reset-password/${resetToken}`;
        await sendEmail(email, `Reset password url for your account with email ${email}`, resetPasswordUrl);
        res.status(200).json({
            success: true,
            message: "Reset url sent to your mail",
        });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

export const reset = async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    try {
        const forgotpasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const user = await User.findOne({
            forgotpasswordToken,
            forgotpasswordExpiry: { $gt: Date.now() },
        });
        if (!user) return next(new AppError("Invalid or expired reset token", 400));

        user.password = password;
        user.forgotpasswordToken = undefined;
        user.forgotpasswordExpiry = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

// Robust profile update

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) return next(new AppError("User not found", 404));

        // Fields allowed to update
        const fields = [
            "name", "email", "bio", "github", "linkedin", "prn", "branch",
            "classroom", "rollNo", "role", "division", "year",
            "leetcode_username", "codechef_username", "codeforces_username", "github_username"
        ];

        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        // ✅ HANDLE AVATAR UPLOAD (Vercel-safe)
        if (req.file) {
            // Delete old avatar if exists
            if (user.avatar?.public_id) {
                await cloudinary.uploader.destroy(user.avatar.public_id);
            }

            // Upload new avatar using buffer
            const uploadToCloudinary = () =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: "SKILL",
                            resource_type: "image",
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(req.file.buffer);
                });

            const result = await uploadToCloudinary();

            user.avatar = {
                public_id: result.public_id,
                secure_url: result.secure_url,
            };

            user.profilePic = result.secure_url;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user,
        });
    } catch (error) {
        console.error("Update error:", error);
        next(new AppError(error.message || "Internal Server Error", 500));
    }
};



export const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    if (!id) return next(new AppError("Id not found", 400));
    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

export const getTeacherbyid = async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        if (!teacherId) return next(new AppError("TeacherId not found", 400));
        const teacher = await User.findById(teacherId);
        if (!teacher) return next(new AppError("Teacher not found", 404));
        res.status(200).json({
            success: true,
            message: "Teacher found",
            teacher,
        });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};

export const updateUserSolvedQuestions = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { questionId, status } = req.body;
        if (!userId || !questionId || status == null)
            return res.status(400).json({ message: "userId, questionId and status required" });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.solvedQuestions = user.solvedQuestions.filter(q => q.questionId.toString() !== questionId);

        if (status) {
            user.solvedQuestions.push({ questionId, status: "true" });
        }

        await user.save();
        res.status(200).json({
            success: true,
            solvedQuestions: user.solvedQuestions,
        });
    } catch (error) {
        return next(error);
    }
};


export const getSolvedQuestions = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) return next(new AppError("User ID is required", 400));
        const user = await User.findById(userId).select("solvedQuestions");
        if (!user) return next(new AppError("User not found", 404));
        res.status(200).json({
            success: true,
            solvedQuestions: user.solvedQuestions,
        });
    } catch (error) {
        next(new AppError(error.message || error, 500));
    }
};


export default {
    login,
    signup,
    regenerate_otp,
    validate_otp_email,
    logout,
    update,
    getAllStudents,
    getAllTeachers,
    getProfile,
    forgotPassword,
    reset,
    deleteUser,
    getTeacherbyid,
    updateUserSolvedQuestions,
    getSolvedQuestions,
};
