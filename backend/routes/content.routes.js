const express = require("express");
const router = express.Router();
const contentController = require("../controllers/content.controller");

// GET /api/content?tags=HTML+basics&language=hi — fetch YouTube content for tags
router.get("/", contentController.getContent);

module.exports = router;
