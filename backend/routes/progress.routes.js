const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progress.controller");
const { validate, progressSchema } = require("../utils/validators");

// GET /api/progress/:userId — get full progress record
router.get("/:userId", progressController.getProgress);

// POST /api/progress/complete — mark a lesson as complete
router.post("/complete", validate(progressSchema), progressController.completeLesson);

module.exports = router;
