const questionsData = require("../data/questions.json");
const { calculateScores } = require("../utils/ruleEngine");
const { setDoc, getDoc } = require("../services/firebase.service");
const { AppError } = require("../utils/errorHandler");

const questionsMap = questionsData.questions.reduce((acc, q) => {
  acc[q.id] = q;
  return acc;
}, {});

/**
 * GET /api/quiz/questions
 * Returns starting questions (one per domain) for the adaptive quiz.
 */
const getQuestions = (req, res) => {
  const starters = questionsData.startingQuestions.map((id) => {
    const q = questionsMap[id];
    return {
      id: q.id,
      domain: q.domain,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
    };
  });
  res.json({ success: true, data: starters, total: starters.length });
};

/**
 * GET /api/quiz/next?questionId=math_easy_1&isCorrect=true
 * Returns the next adaptive question based on current question and result.
 */
const getNextQuestion = (req, res, next) => {
  try {
    const { questionId, isCorrect } = req.query;
    if (!questionId) throw new AppError("questionId is required", 400);

    const current = questionsMap[questionId];
    if (!current) throw new AppError("Question not found", 404);

    const correct = isCorrect === "true";
    const nextId = correct ? current.nextIfCorrect : current.nextIfWrong;

    if (!nextId) {
      return res.json({ success: true, data: null, message: "No more questions in this domain." });
    }

    const next = questionsMap[nextId];
    res.json({
      success: true,
      data: {
        id: next.id,
        domain: next.domain,
        difficulty: next.difficulty,
        question: next.question,
        options: next.options,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/quiz/submit
 * Scores the quiz using ruleEngine, stores in Firestore.
 * Body: { userId, answers: [{ questionId, selectedOption, domain, difficulty }] }
 */
const submitQuiz = async (req, res, next) => {
  try {
    const { userId, answers } = req.body;

    // Enrich answers with correctness
    const enrichedAnswers = answers.map((ans) => {
      const question = questionsMap[ans.questionId];
      if (!question) throw new AppError(`Question ${ans.questionId} not found`, 404);
      return {
        ...ans,
        isCorrect: ans.selectedOption === question.correct,
      };
    });

    // Calculate domain scores (0–100)
    const rawScores = calculateScores(enrichedAnswers);

    // Persist to Firestore
    await setDoc("quizResults", userId, {
      scores: rawScores,
      answersCount: answers.length,
      completedAt: new Date().toISOString(),
    });

    res.json({ success: true, data: { scores: rawScores, userId } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getQuestions, getNextQuestion, submitQuiz };
