const axios = require("axios");

const YT_BASE_URL = "https://www.googleapis.com/youtube/v3";

/**
 * Searches YouTube for educational videos given a query.
 * Optimized for low-bandwidth: returns only id, title, thumbnail (medium).
 * @param {string} query - search term
 * @param {number} maxResults - default 5
 * @returns {Array} video results
 */
const searchVideos = async (query, maxResults = 5) => {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY environment variable is not set.");
  }

  const response = await axios.get(`${YT_BASE_URL}/search`, {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      q: `${query} tutorial for beginners`,
      part: "snippet",
      type: "video",
      maxResults,
      videoDuration: "medium",       // 4–20 minutes (micro-learning)
      videoEmbeddable: true,
      relevanceLanguage: "hi",       // Prefer Hindi results (can be overridden)
      safeSearch: "strict",
      fields:
        "items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails/medium)",
    },
  });

  return response.data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || null,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
};

/**
 * Fetches content for a given roadmap week's tags.
 * @param {string[]} tags - e.g. ["HTML basics", "web development"]
 * @param {string} language - "en" | "hi" | "te"
 * @returns {Array}
 */
const getContentForTags = async (tags, language = "en") => {
  const relevanceLang = language === "en" ? "en" : "hi";
  const query = tags.slice(0, 2).join(" ") + " free tutorial";

  const videos = await searchVideos(query, 4);

  // Lightweight: return only what frontend needs
  return videos.map((v) => ({
    ...v,
    type: "video",
  }));
};

module.exports = { searchVideos, getContentForTags };
