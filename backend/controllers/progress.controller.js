const { getDoc, setDoc, getFirestore } = require("../services/firebase.service");
const admin = require("firebase-admin");
const { AppError } = require("../utils/errorHandler");

/**
 * GET /api/progress/:userId
 */
const getProgress = async (req, res, next) => {
  try {
    const progress = await getDoc("progress", req.params.userId);
    if (!progress) {
      return res.status(404).json({ success: false, message: "No progress record found." });
    }
    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/progress/complete
 * Marks a lesson complete, updates percentComplete and currentWeek.
 * Body: { userId, lessonId, weekNumber }
 */
const completeLesson = async (req, res, next) => {
  try {
    const { userId, lessonId, weekNumber } = req.body;

    const progress = await getDoc("progress", userId);
    if (!progress) throw new AppError("Progress record not found. Generate a roadmap first.", 404);

    const completedLessons = progress.completedLessons || [];

    // Idempotent: don't double-count
    if (completedLessons.includes(lessonId)) {
      return res.json({ success: true, data: progress, message: "Already marked complete." });
    }

    const updatedLessons = [...completedLessons, lessonId];
    const totalWeeks = progress.totalWeeks || 4;

    // Estimate percent: each week has ~3 lessons on average
    const estimatedTotal = totalWeeks * 3;
    const percentComplete = Math.min(
      Math.round((updatedLessons.length / estimatedTotal) * 100),
      100
    );

    const currentWeek = Math.max(progress.currentWeek || 1, weekNumber);

    await setDoc("progress", userId, {
      completedLessons: updatedLessons,
      currentWeek,
      percentComplete,
      totalWeeks,
    });

    res.json({
      success: true,
      data: { completedLessons: updatedLessons, currentWeek, percentComplete },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProgress, completeLesson };
