const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildRoadmapPrompt, buildMentorPrompt } = require("../utils/promptBuilder");

let genAI = null;

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Generates career roadmap from enriched student profile.
 * Returns parsed JSON or throws structured error.
 */
const generateRoadmap = async (enrichedProfile, language = "en") => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
    },
  });

  const prompt = buildRoadmapPrompt(enrichedProfile, language);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("=== GEMINI OUTPUT ===");
    console.log("FINISH REASON:", result.response.candidates?.[0]?.finishReason);
    console.log(text);

    // Strip any accidental markdown fences
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Basic validation of response shape
    if (!parsed.careers || !parsed.roadmap) {
      throw new Error("AI response missing required fields: careers or roadmap.");
    }

    return parsed;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error("AI returned malformed JSON. Please try again.");
    }
    throw err;
  }
};

/**
 * Sends a chat message to the AI mentor.
 * Returns a plain string response.
 */
const chatWithMentor = async (userMessage, studentContext, language = "en") => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 256,
    },
  });

  const prompt = buildMentorPrompt(userMessage, studentContext, language);
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

module.exports = { generateRoadmap, chatWithMentor };
