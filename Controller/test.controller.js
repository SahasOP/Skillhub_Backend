import Test from "../Config/Models/test.model.js";
import User from "../Config/Models/user.model.js";
import Marks from "../Config/Models/marks.model.js";
import AppError from "../utils/AppError.js";

// Helper to validate and format questions for both MCQ and Direct Answer types
const formatQuestions = (questions) => {
  return questions.map((q) => {
    if (!q.question || typeof q.question !== "string") throw new AppError("Each question must have valid text.", 400);

    if (q.type === "mcq") {
      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) throw new AppError("MCQ questions require at least two options.", 400);

      const answer = q.correctAnswer?.toUpperCase();
      if (!answer || !"ABCD".includes(answer)) throw new AppError(`MCQ correct answer must be one of A, B, C, D.`, 400);

      const idx = "ABCD".indexOf(answer);
      if (idx >= q.options.length) throw new AppError("Correct answer does not correspond to any option.", 400);

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.options[idx],
        marks: Number(q.marks) || 0,
        type: "mcq",
      };
    }

    if (q.type === "directAnswer") {
      if (!q.correctAnswer || !q.correctAnswer.trim()) throw new AppError("Direct answer questions must have a valid answer.", 400);

      return {
        question: q.question,
        correctAnswer: q.correctAnswer.trim(),
        marks: Number(q.marks) || 0,
        type: "directAnswer",
      };
    }

    throw new AppError(`Unknown question type '${q.type}'.`, 400);
  });
};

// Utility to safely format student references from input array
const formatStudents = (students) => {
  if (!Array.isArray(students) || students.length === 0) {
    throw new AppError("At least one student must be allocated.", 400);
  }
  return students.map((s) => ({ student: s._id || s }));
};

const createTest = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { testName, duration, subject, instructions, questions, testDate, testTime, teacherName, testCreationDate, marksPerQuestion, department, year, students } = req.body;

    // Basic validation
    if (!testName || !duration || !instructions || !Array.isArray(questions) || questions.length === 0 || !testDate || !testTime || !testCreationDate || !marksPerQuestion || !Array.isArray(students) || students.length === 0) {
      return next(new AppError("All required fields, including students, must be provided.", 400));
    }

    const teacher = await User.findById(teacherId);
    if (!teacher) return next(new AppError("Invalid teacher ID.", 401));

    // Format questions & students
    const formattedQuestions = formatQuestions(questions);
    const formattedStudents = formatStudents(students);

    // Calculate totalMarks from questions' marks or use marksPerQuestion * number of questions
    const totalMarks = formattedQuestions.reduce((sum, q) => sum + (q.marks || marksPerQuestion), 0);

    const newTest = await Test.create({
      testName,
      duration,
      subject,
      instructions,
      questions: formattedQuestions,
      teacherName,
      teacherId,
      testDate,
      testTime,
      testCreationDate,
      marksPerQuestion,
      totalMarks,
      department,
      year,
      Students_alloted: formattedStudents,
      Students_appeared: [],
      average_score: 0,
    });

    res.status(201).json({ success: true, message: "Test created successfully.", data: newTest });
  } catch (error) {
    console.error(error);
    return next(error instanceof AppError ? error : new AppError("Internal Server Error", 500));
  }
};

const editTest = async (req, res, next) => {
  try {
    const testId = req.params.testId;
    const { testName, duration, subject, instructions, questions, testDate, testTime, teacherName, marksPerQuestion, department, year, students } = req.body;

    if (!testName || !duration || !instructions || !Array.isArray(questions) || questions.length === 0 || !testDate || !testTime || !marksPerQuestion) {
      return next(new AppError("All required fields must be provided.", 400));
    }

    const existingTest = await Test.findById(testId);
    if (!existingTest) return next(new AppError("Test not found.", 404));

    const formattedQuestions = formatQuestions(questions);

    const formattedStudents = Array.isArray(students) && students.length > 0 ? formatStudents(students) : existingTest.Students_alloted || [];

    const totalMarks = formattedQuestions.reduce((sum, q) => sum + (q.marks || marksPerQuestion), 0);

    const updatedTest = await Test.findByIdAndUpdate(
      testId,
      {
        testName,
        duration,
        subject,
        instructions,
        teacherName,
        questions: formattedQuestions,
        testDate,
        testTime,
        marksPerQuestion,
        totalMarks,
        department,
        year,
        Students_alloted: formattedStudents,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Test updated successfully.", data: updatedTest });
  } catch (error) {
    console.error(error);
    return next(error instanceof AppError ? error : new AppError("Internal Server Error", 500));
  }
};

const deleteTest = async (req, res, next) => {
  try {
    const testId = req.params.testId;
    const test = await Test.findById(testId);

    if (!test) return next(new AppError("Test not found.", 404));

    await Test.findByIdAndDelete(testId);

    res.status(200).json({ success: true, message: "Test deleted successfully." });
  } catch (error) {
    console.error(error);
    return next(error instanceof AppError ? error : new AppError("Internal Server Error", 500));
  }
};

const getTestsByTeacherId = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const tests = await Test.find({ teacherId });

    if (!tests.length) return next(new AppError("No tests found for this teacher.", 404));

    res.status(200).json({ success: true, message: `Tests for teacher ${teacherId}`, data: tests });
  } catch (error) {
    console.error(error);
    return next(new AppError("Internal Server Error", 500));
  }
};

const getAllTests = async (req, res, next) => {
  try {
    const tests = await Test.find();
    res.status(200).json({ success: true, message: "All tests", data: tests });
  } catch (error) {
    console.error(error);
    return next(new AppError("Internal Server Error", 500));
  }
};

const getTestById = async (req, res, next) => {
  try {
    const testId = req.params.id;
    const test = await Test.findById(testId);
    if (!test) return next(new AppError("Test not found", 404));
    res.status(200).json({ success: true, message: `Test ${testId}`, data: test });
  } catch (error) {
    console.error(error);
    return next(new AppError("Internal Server Error", 500));
  }
};

const submitTest = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { test_id, name, email, prn, marks_obtained, question_appeared } = req.body;

    const user = await User.findById(studentId);
    if (!user) return next(new AppError("User not found", 404));

    if (!Array.isArray(question_appeared)) {
      return next(new AppError("Invalid question data", 400));
    }

    const marksData = {
      student: studentId,
      test_id,
      name,
      email,
      prn,
      marks_obtained,
      question_appeared: question_appeared.map((q) => ({
        your_answer: q.your_answer || "",
        correct_answer: q.correct_answer || "",
        mark: q.mark || 0,
      })),
    };

    await Marks.create(marksData);

    const test = await Test.findById(test_id);
    if (!test) return next(new AppError("Test not found", 404));

    if (!Array.isArray(test.Students_appeared)) test.Students_appeared = [];

    test.Students_appeared.push({
      student: studentId,
      name,
      email,
      prn,
      marks_obtained,
      dateofgiving: new Date(),
    });

    // Update average score
    const totalScore = test.Students_appeared.reduce((sum, s) => sum + (s.marks_obtained || 0), 0);
    test.average_score = totalScore / test.Students_appeared.length;

    await test.save();

    res.status(200).json({
      success: true,
      message: "Test submitted successfully",
      marks: marksData,
      updatedTest: test,
    });
  } catch (error) {
    console.error(error);
    return next(error instanceof AppError ? error : new AppError("Internal Server Error", 500));
  }
};

const getTestsByStudentId = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return next(new AppError("Student ID required", 400));

    const tests = await Test.find({ "Students_alloted.student": studentId });
    if (!tests.length) {
      return res.status(404).json({
        success: false,
        message: "No tests found for this student.",
      });
    }

    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    console.error(error);
    return next(new AppError("Internal Server Error", 500));
  }
};

const getMarksByStudentId = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    if (!studentId) return next(new AppError("User ID not found", 400));

    const marks = await Marks.find({ student: studentId });
    if (!marks.length) return next(new AppError("Marks not found", 404));

    res.status(200).json({
      success: true,
      message: "All Marks by the student",
      data: marks,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Internal Server Error", 500));
  }
};

const getMarksForCurrentTest = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { test_id } = req.params;
    if (!studentId || !test_id) return next(new AppError("Missing parameters", 400));

    const marks = await Marks.findOne({ student: studentId, test_id });
    if (!marks) return next(new AppError("Marks not found", 404));

    res.status(200).json({ success: true, message: "Marks found", data: marks });
  } catch (error) {
    console.error(error);
    return next(new AppError("Internal Server Error", 500));
  }
};

const getMarksForTestId = async (req, res, next) => {
  try {
    const { test_id } = req.params;
    if (!test_id) return next(new AppError("Test ID required", 400));

    const marks = await Marks.find({ test_id });
    if (!marks.length) return next(new AppError("Marks not found", 404));

    res.status(200).json({ success: true, message: "Marks found", data: marks });
  } catch (error) {
    console.error(error);
    return next(new AppError("Internal Server Error", 500));
  }
};

export { createTest, editTest, deleteTest, getTestsByTeacherId, getAllTests, getTestById, submitTest, getTestsByStudentId, getMarksByStudentId, getMarksForCurrentTest, getMarksForTestId };
