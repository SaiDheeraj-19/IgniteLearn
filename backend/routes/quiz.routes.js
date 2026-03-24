const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");
const { validate, quizSubmitSchema } = require("../utils/validators");

// GET /api/quiz/questions — returns the initial adaptive question set
router.get("/questions", quizController.getQuestions);

// GET /api/quiz/next — returns next question based on current answer
router.get("/next", quizController.getNextQuestion);

// POST /api/quiz/submit — scores answers and stores results
router.post("/submit", validate(quizSubmitSchema), quizController.submitQuiz);

module.exports = router;
