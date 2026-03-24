/**
 * Rule-Based Scoring Engine
 * Pre-processes raw quiz scores before sending to AI.
 * This ensures deterministic, explainable rules run BEFORE the AI prompt.
 */

const DOMAINS = ["math", "logic", "english", "science", "creativity"];

/**
 * Classifies a single domain score into a level.
 * @param {number} score - 0–100
 * @returns {"beginner"|"intermediate"|"advanced"}
 */
const classifyLevel = (score) => {
  if (score < 40) return "beginner";
  if (score <= 70) return "intermediate";
  return "advanced";
};

/**
 * Produces a structured profile from raw scores.
 * @param {Object} rawScores - e.g. { math: 65, logic: 80, english: 35, science: 50, creativity: 72 }
 * @param {string[]} interests - e.g. ["technology", "art"]
 * @returns {Object} enrichedProfile
 */
const processScores = (rawScores, interests = []) => {
  const levels = {};
  const strengths = [];
  const weaknesses = [];
  const flags = {};

  DOMAINS.forEach((domain) => {
    const score = rawScores[domain] ?? 0;
    const level = classifyLevel(score);
    levels[domain] = { score, level };

    if (score >= 70) strengths.push(domain);
    if (score < 40) weaknesses.push(domain);
  });

  // ─── Special Flags ────────────────────────────────────────────────────────
  if ((rawScores.logic ?? 0) > 70) flags.analyticalStrength = true;
  if ((rawScores.creativity ?? 0) > 65) flags.creativeAptitude = true;
  if ((rawScores.english ?? 0) < 40) flags.preferVernacularContent = true;
  if ((rawScores.math ?? 0) > 70 && (rawScores.logic ?? 0) > 70) flags.stemReady = true;
  if (interests.includes("technology") || interests.includes("coding")) flags.techInterest = true;
  if (interests.includes("art") || interests.includes("design")) flags.creativeInterest = true;

  // ─── Overall Level ────────────────────────────────────────────────────────
  const avgScore =
    DOMAINS.reduce((sum, d) => sum + (rawScores[d] ?? 0), 0) / DOMAINS.length;
  const overallLevel = classifyLevel(avgScore);

  return {
    rawScores,
    levels,
    overallLevel,
    strengths,
    weaknesses,
    flags,
    interests,
    avgScore: Math.round(avgScore),
  };
};

/**
 * Calculates per-domain scores from submitted quiz answers.
 * Each correct answer in a domain adds weighted points (easy=10, medium=15, hard=20).
 * @param {Array} answers - array of { questionId, selectedOption, correctOption, domain, difficulty }
 * @returns {Object} rawScores per domain (0–100)
 */
const calculateScores = (answers) => {
  const domainData = {};

  answers.forEach(({ domain, difficulty, isCorrect }) => {
    if (!domainData[domain]) domainData[domain] = { earned: 0, max: 0 };

    const weight = difficulty === "hard" ? 20 : difficulty === "medium" ? 15 : 10;
    domainData[domain].max += weight;
    if (isCorrect) domainData[domain].earned += weight;
  });

  const rawScores = {};
  DOMAINS.forEach((domain) => {
    if (domainData[domain]) {
      rawScores[domain] = Math.round(
        (domainData[domain].earned / domainData[domain].max) * 100
      );
    } else {
      rawScores[domain] = 0;
    }
  });

  return rawScores;
};

module.exports = { processScores, calculateScores, classifyLevel };
