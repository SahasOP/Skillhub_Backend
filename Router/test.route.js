import { Router } from "express";
import {
  createTest,
  editTest,
  deleteTest,
  getTestsByTeacherId,
  getAllTests,
  getTestById,
  submitTest,
  getTestsByStudentId,
  getMarksByStudentId,
  getMarksForCurrentTest,
  getMarksForTestId,
} from "../Controller/test.controller.js";
import { isLoggedIn, isTeacher } from "../middleware/auth.middleware.js";


const router = Router()

router.post('/create', isLoggedIn, isTeacher, createTest)
router.post('/editTest/:testId', editTest)
router.delete('/deleteTest/:testId', deleteTest)
router.get('/getTestsByTeacherid', isLoggedIn, isTeacher, getTestsByTeacherId);
router.get('/getall', isLoggedIn, getAllTests)
router.get('/getTestById/:id', isLoggedIn, getTestById)
router.post('/submitTest', isLoggedIn, submitTest)
router.get("/student/:studentId", getTestsByStudentId);
router.get('/marks', isLoggedIn, getMarksByStudentId)
router.get('/getcurrentmarks/:test_id', isLoggedIn, getMarksForCurrentTest)
router.get('/getmarksfortestid/:test_id', isLoggedIn, getMarksForTestId)
export default router;