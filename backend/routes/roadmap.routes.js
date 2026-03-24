const express = require("express");
const router = express.Router();
const roadmapController = require("../controllers/roadmap.controller");
const { validate, roadmapSchema } = require("../utils/validators");

// POST /api/roadmap/generate — generates AI roadmap for user
router.post("/generate", validate(roadmapSchema), roadmapController.generateRoadmap);

// GET /api/roadmap/:userId — fetches stored roadmap
router.get("/:userId", roadmapController.getRoadmap);

// POST /api/roadmap/mentor — AI chat mentor message
router.post("/mentor", roadmapController.chatMentor);

module.exports = router;
