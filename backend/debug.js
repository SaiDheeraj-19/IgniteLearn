require('dotenv').config();

async function run() {
  try {
    const { getDoc } = require('./services/firebase.service');
    // Test firebase connection simply
    console.log("Testing Firebase...");
    await getDoc('progress', 'test_uid_fake');
    console.log("Firebase works!");
  } catch (err) {
    console.error("FIREBASE ERROR:", err.message);
  }

  try {
    const { generateRoadmap } = require('./services/gemini.service');
    console.log("Testing Gemini...");
    const profile = {
      rawScores: { math: 50, logic: 50, english: 50, science: 50, creativity: 50 },
      levels: {},
      overallLevel: 'intermediate',
      strengths: [],
      weaknesses: [],
      flags: {},
      interests: ['technology'],
      avgScore: 50
    };
    await generateRoadmap(profile, 'en');
    console.log("Gemini works!");
  } catch(err) {
    console.error("GEMINI ERROR:", err.message);
    if(err.response) console.error(err.response.data);
  }
}

run();
