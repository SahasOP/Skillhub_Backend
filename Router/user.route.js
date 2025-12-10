import { Router } from "express";
import {
  deleteUser,
  forgotPassword,
  getAllStudents,
  getAllTeachers,
  // getAllStudentss,
  getProfile,
  getTeacherbyid,
  login,
  logout,
  regenerate_otp,
  reset,
  signup,
  update,
  validate_otp_email,
  updateUserSolvedQuestions,
  getSolvedQuestions
} from "../Controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import {
  leetcode,
  codechef,
  geeksforgeeks,
  codingninjas,
  codeforces,
  github,
  hackerrank,
} from "../utils/codingdata.js";
import upload from "../middleware/multer.middleware.js";
const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
// router.put("/update/:id", isLoggedIn, update);
router.patch('/update/:id', upload.single('avatar'), isLoggedIn, update)

router.post("/validate", validate_otp_email);
router.post("/regenerate", regenerate_otp);
router.get("/me", isLoggedIn, getProfile);
router.post("/forgot", forgotPassword);
router.post("/reset/:resetToken", reset);
router.get("/test", (req, res) => {
  res.json({ message: "API is working" });
});
router.delete('/deleteUser/:id', deleteUser)
router.get('/getStudents', getAllStudents)
router.get('/getTeachers', getAllTeachers)

router.post("/github/:id", github);
router.post("/leetcode/:id", leetcode);
router.post("/codeforces/:id", codeforces);
router.post("/codechef/:id", codechef);
router.post("/geeksforgeeks/:id", geeksforgeeks);
router.post("/codingninjas/:id", codingninjas);
router.get("/hackerrank/:id", hackerrank);
router.get('/teacher/:teacherId', getTeacherbyid)

router.get("/solvedQuestions/:userId", isLoggedIn, getSolvedQuestions);

router.put("/solvedQuestions/:userId", updateUserSolvedQuestions);

export default router;