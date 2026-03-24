/**
 * Prompt Builder Utility
 * Assembles structured, deterministic prompts for Gemini API.
 */

const LANGUAGE_LABELS = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
};

/**
 * Builds the main roadmap/career generation prompt.
 * @param {Object} enrichedProfile - output from ruleEngine.processScores()
 * @param {string} language - "en" | "hi" | "te"
 * @returns {string} formatted prompt string
 */
const buildRoadmapPrompt = (enrichedProfile, language = "en") => {
  const { rawScores, levels, overallLevel, strengths, weaknesses, flags, interests } =
    enrichedProfile;

  const langLabel = LANGUAGE_LABELS[language] || "English";

  const scoresSummary = Object.entries(levels)
    .map(([domain, { score, level }]) => `  - ${domain}: ${score}/100 (${level})`)
    .join("\n");

  const flagsList = Object.keys(flags)
    .filter((k) => flags[k])
    .join(", ") || "none";

  return `You are IgniteLearn, an AI career counselor for students in rural/semi-urban India aged 13–22.
Respond ONLY in valid JSON. Do NOT include markdown, code fences, or explanations outside JSON.

STUDENT PROFILE:
- Overall Level: ${overallLevel}
- Average Score: ${enrichedProfile.avgScore}/100
- Domain Scores:
${scoresSummary}
- Strengths: ${strengths.join(", ") || "none identified"}
- Weaknesses: ${weaknesses.join(", ") || "none identified"}
- Interests: ${interests.join(", ") || "not specified"}
- Special Flags: ${flagsList}
- Preferred Language: ${langLabel}

TASK:
Based on the student profile above, generate:
1. Top 3 career suggestions (with match percentage and short description in ${langLabel})
2. A 4-week learning roadmap with weekly topics, estimated duration, and 2–3 resource tags per week
3. Key skill gaps to address
4. A short motivational explanation for the student

RULES:
- Career suggestions must be realistic for rural India job markets (include digital, trade, creative careers)
- Roadmap must be practical: max 5 hours/week study time
- Use simple language (grade 8 reading level)
- Prioritize free/affordable learning resources
- If preferVernacularContent flag is true: suggest vernacular YouTube channels or local resources

RESPOND ONLY WITH THIS JSON STRUCTURE:
{
  "careers": [
    {
      "title": "string",
      "matchPercent": number,
      "description": "string",
      "avgSalary": "string",
      "skills": ["string"]
    }
  ],
  "roadmap": [
    {
      "week": number,
      "topic": "string",
      "description": "string",
      "durationHours": number,
      "tags": ["string"],
      "resources": [{ "title": "string", "type": "youtube|article|practice", "searchQuery": "string" }]
    }
  ],
  "skillGaps": ["string"],
  "explanation": "string",
  "motivationalMessage": "string"
}`;
};

/**
 * Builds a chat mentor prompt for the AI mentor feature.
 * @param {string} userMessage
 * @param {Object} studentContext - { name, level, currentWeek, currentTopic }
 * @param {string} language
 * @returns {string}
 */
const buildMentorPrompt = (userMessage, studentContext, language = "en") => {
  const langLabel = LANGUAGE_LABELS[language] || "English";
  return `You are Spark, a friendly AI mentor on IgniteLearn helping ${studentContext.name || "a student"}.
Student level: ${studentContext.level || "beginner"}.
Currently on Week ${studentContext.currentWeek || 1}: ${studentContext.currentTopic || "getting started"}.
Respond concisely in ${langLabel} (2–4 sentences max). Be encouraging, practical, and simple.
Student message: "${userMessage}"`;
};

module.exports = { buildRoadmapPrompt, buildMentorPrompt };
