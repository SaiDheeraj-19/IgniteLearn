const { getDoc, setDoc } = require("../services/firebase.service");
const { generateRoadmap, chatWithMentor } = require("../services/gemini.service");
const { processScores } = require("../utils/ruleEngine");
const { AppError } = require("../utils/errorHandler");

/**
 * POST /api/roadmap/generate
 * Runs rule-based pre-processing → AI generation → Firestore persistence.
 * Body: { userId, interests: [], language: "en" }
 */
const generateRoadmapController = async (req, res, next) => {
  try {
    const { userId, interests, language } = req.body;

    // 1. Fetch stored quiz scores
    const quizResult = await getDoc("quizResults", userId);
    if (!quizResult) {
      throw new AppError("No quiz results found for this user. Complete the quiz first.", 404);
    }

    // 2. Rule-based pre-processing (deterministic, before AI)
    const enrichedProfile = processScores(quizResult.scores, interests);

    // 3. AI Generation (Gemini)
    const aiResponse = await generateRoadmap(enrichedProfile, language);

    // 4. Persist roadmap to Firestore
    await setDoc("roadmaps", userId, {
      careers: aiResponse.careers,
      roadmap: aiResponse.roadmap,
      skillGaps: aiResponse.skillGaps,
      explanation: aiResponse.explanation,
      motivationalMessage: aiResponse.motivationalMessage,
      interests,
      language,
      generatedAt: new Date().toISOString(),
    });

    // 5. Initialize progress record if not existing
    const existingProgress = await getDoc("progress", userId);
    if (!existingProgress) {
      await setDoc("progress", userId, {
        completedLessons: [],
        currentWeek: 1,
        percentComplete: 0,
        totalWeeks: aiResponse.roadmap.length,
      });
    }

    res.json({ success: true, data: aiResponse });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/roadmap/:userId
 * Returns stored roadmap from Firestore.
 */
const getRoadmap = async (req, res, next) => {
  try {
    const roadmap = await getDoc("roadmaps", req.params.userId);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "No roadmap found. Generate one first." });
    }
    res.json({ success: true, data: roadmap });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/roadmap/mentor
 * AI Chat Mentor — responds to student questions with context.
 * Body: { message, studentContext: { name, level, currentWeek, currentTopic }, language }
 */
const chatMentor = async (req, res, next) => {
  try {
    const { message, studentContext = {}, language = "en" } = req.body;
    if (!message || message.trim().length === 0) {
      throw new AppError("Message is required", 400);
    }

    const reply = await chatWithMentor(message.trim(), studentContext, language);
    res.json({ success: true, data: { reply } });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateRoadmap: generateRoadmapController, getRoadmap, chatMentor };
