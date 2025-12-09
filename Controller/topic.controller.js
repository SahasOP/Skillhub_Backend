import { Category, Topic } from "../Config/Models/topic.model.js";
import AppError from "../utils/AppError.js";

/**
 * Create a new Category
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return next(new AppError("Category name is required", 400));

    const existing = await Category.findOne({ name });
    if (existing) return next(new AppError("Category already exists", 409));

    const category = await Category.create({ name, topics: [] });
    res.status(201).json({ success: true, message: "Category created", category });
  } catch (err) {
    next(new AppError(err.message || "Failed to create category", 500));
  }
};

/**
 * Edit existing Category
 */
export const editCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return next(new AppError("Category name is required", 400));

    const category = await Category.findById(id);
    if (!category) return next(new AppError("Category not found", 404));

    category.name = name;
    await category.save();

    res.status(200).json({ success: true, message: "Category updated", category });
  } catch (err) {
    next(new AppError(err.message || "Failed to update category", 500));
  }
};

/**
 * Delete a Category
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return next(new AppError("Category not found", 404));
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    next(new AppError(err.message || "Failed to delete category", 500));
  }
};

/**
 * Get all Categories with topics
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    if (!categories.length) return next(new AppError("No categories found", 404));
    res.status(200).json({ success: true, message: "All categories", categories });
  } catch (err) {
    next(new AppError(err.message || "Failed to fetch categories", 500));
  }
};

/**
 * Get Category by ID (with topics)
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return next(new AppError("Category not found", 404));
    res.status(200).json({ success: true, category });
  } catch (err) {
    next(new AppError(err.message || "Failed to fetch category", 500));
  }
};

/**
 * Create a Topic under Category
 */
export const createTopic = async (req, res, next) => {
  try {
    const { id: categoryId } = req.params;
    const { icon, title, description, color, questions = [] } = req.body;

    if (!icon || !title || !description || !color) {
      return next(new AppError("All topic fields are required", 400));
    }

    const category = await Category.findById(categoryId);
    if (!category) return next(new AppError("Category not found", 404));

    category.topics.push({ icon, title, description, color, questions });
    await category.save();

    res.status(201).json({ success: true, message: "Topic added", topic: category.topics.slice(-1)[0] });
  } catch (err) {
    next(new AppError(err.message || "Failed to add topic", 500));
  }
};

/**
 * Edit a Topic under Category
 */
export const editTopic = async (req, res, next) => {
  try {
    const { id: categoryId, topicId } = req.params;
    const { icon, title, description, color, questions } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return next(new AppError("Category not found", 404));

    const topic = category.topics.id(topicId);
    if (!topic) return next(new AppError("Topic not found", 404));

    if (icon) topic.icon = icon;
    if (title) topic.title = title;
    if (description) topic.description = description;
    if (color) topic.color = color;
    if (Array.isArray(questions)) topic.questions = questions;

    await category.save();

    res.status(200).json({ success: true, message: "Topic updated", topic });
  } catch (err) {
    next(new AppError(err.message || "Failed to update topic", 500));
  }
};

/**
 * Delete a Topic from a Category
 */
export const deleteTopic = async (req, res, next) => {
  try {
    const { id: categoryId, topicId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return next(new AppError("Category not found", 404));

    category.topics = category.topics.filter(t => t._id.toString() !== topicId);
    await category.save();

    res.status(200).json({ success: true, message: "Topic deleted" });
  } catch (err) {
    next(new AppError(err.message || "Failed to delete topic", 500));
  }
};

/**
 * Add a question to a topic
 */
export const addQuestionToTopic = async (req, res, next) => {
  try {
    const { categoryId, topicId } = req.params;
    const questionData = req.body;

    // Validate required question fields
    if (!questionData.problem || !questionData.practice || !questionData.difficulty) {
      return next(new AppError("Key question fields are required", 400));
    }

    const category = await Category.findById(categoryId);
    if (!category) return next(new AppError("Category not found", 404));

    const topic = category.topics.id(topicId);
    if (!topic) return next(new AppError("Topic not found", 404));

    topic.questions.push(questionData);
    await category.save();

    res.status(201).json({ success: true, message: "Question added", topic });
  } catch (err) {
    next(new AppError(err.message || "Failed to add question", 500));
  }
};

/**
 * Update a question within a topic
 */
export const updateQuestionInTopic = async (req, res, next) => {
  try {
    const { categoryId, topicId, questionId } = req.params;
    const { problem, practice, difficulty, options, correctAnswer, type } = req.body;

    if (!problem || !practice || !difficulty) {
      return next(new AppError("Question problem, practice, and difficulty are required", 400));
    }

    const category = await Category.findById(categoryId);
    if (!category) return next(new AppError("Category not found", 404));

    const topic = category.topics.id(topicId);
    if (!topic) return next(new AppError("Topic not found", 404));

    const question = topic.questions.id(questionId);
    if (!question) return next(new AppError("Question not found", 404));

    question.problem = problem;
    question.practice = practice;
    question.difficulty = difficulty;
    if (type) question.type = type;
    if (Array.isArray(options)) question.options = options;
    if (correctAnswer) question.correctAnswer = correctAnswer;

    await category.save();

    res.status(200).json({ success: true, message: "Question updated", question });
  } catch (err) {
    next(new AppError(err.message || "Failed to update question", 500));
  }
};

/**
 * Delete a question from a topic
 */
export const deleteQuestionFromTopic = async (req, res, next) => {
  try {
    const { categoryId, topicId, questionId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) return next(new AppError("Category not found", 404));

    const topic = category.topics.id(topicId);
    if (!topic) return next(new AppError("Topic not found", 404));

    topic.questions = topic.questions.filter(q => q._id.toString() !== questionId);

    await category.save();

    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (err) {
    next(new AppError(err.message || "Failed to delete question", 500));
  }
};


/**
 * Get all topics across categories (optional, for admin overview)
 */
export const getAllTopics = async (req, res, next) => {
  try {
    const categories = await Category.find().select('topics');
    const allTopics = categories.flatMap(cat => cat.topics);
    res.status(200).json({ success: true, data: allTopics });
  } catch (err) {
    next(new AppError(err.message || "Failed to fetch topics", 500));
  }
};

/**
 * Get a single topic by ID
 */
export const getTopicById = async (req, res, next) => {
  try {
    const { id: topicId } = req.params;

    // Find topic nested in any category
    const category = await Category.findOne({ "topics._id": topicId }, { "topics.$": 1 });
    if (!category || !category.topics.length) return next(new AppError("Topic not found", 404));

    res.status(200).json({ success: true, topic: category.topics[0] });
  } catch (err) {
    next(new AppError(err.message || "Failed to fetch topic", 500));
  }
};

/**
 * Get topics by category ID
 */
export const getTopicsByCategoryId = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return next(new AppError("Category not found", 404));
    res.status(200).json({ success: true, topics: category.topics });
  } catch (err) {
    next(new AppError(err.message || "Failed to fetch topics by category", 500));
  }
};
