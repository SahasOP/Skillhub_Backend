import { Router } from "express";
import {
  createCategory,
  editCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  createTopic,
  editTopic,
  deleteTopic,
  addQuestionToTopic,
  updateQuestionInTopic,
  deleteQuestionFromTopic,
  getAllTopics,
  getTopicById,
  getTopicsByCategoryId,
} from "../Controller/topic.controller.js";

const router = Router();

// Category routes
router.post("/category", createCategory);
router.put("/category/:id", editCategory);
router.delete("/category/:id", deleteCategory);
router.get("/categories", getCategories);
router.get("/category/:id", getCategoryById);

// Topic routes under a category
router.post("/category/:id/topics", createTopic);
router.put("/category/:id/topics/:topicId", editTopic);
router.delete("/category/:id/topics/:topicId", deleteTopic);
router.get("/topics", getAllTopics);
router.get("/topic/:id", getTopicById);
router.get("/category/:categoryId/topics", getTopicsByCategoryId);

// Question routes under topic and category
router.post("/category/:categoryId/topics/:topicId/questions", addQuestionToTopic);
router.put("/category/:categoryId/topics/:topicId/questions/:questionId", updateQuestionInTopic);
router.delete("/category/:categoryId/topics/:topicId/questions/:questionId", deleteQuestionFromTopic);

export default router;
