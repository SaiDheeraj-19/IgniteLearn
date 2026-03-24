const { getContentForTags } = require("../services/youtube.service");
const { AppError } = require("../utils/errorHandler");

/**
 * GET /api/content?tags=HTML+basics,web+development&language=hi
 */
const getContent = async (req, res, next) => {
  try {
    const { tags, language = "en" } = req.query;
    if (!tags) throw new AppError("tags query parameter is required", 400);

    const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tagArray.length === 0) throw new AppError("At least one tag is required", 400);

    const videos = await getContentForTags(tagArray, language);
    res.json({ success: true, data: videos, count: videos.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { getContent };
