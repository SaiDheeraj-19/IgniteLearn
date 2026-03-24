const express = require("express");
const router = express.Router();

// Auth is handled client-side via Firebase SDK.
// These routes exist for server-side user profile creation only.

const { setDoc, getDoc } = require("../services/firebase.service");
const { validate, registerSchema } = require("../utils/validators");

// POST /api/auth/profile — creates/updates user profile in Firestore after Firebase Auth signup
router.post("/profile", validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, language } = req.body;
    // uid should come from Firebase token in production; using email hash for MVP
    const uid = Buffer.from(email).toString("base64");

    await setDoc("users", uid, { name, email, language, createdAt: new Date().toISOString() });
    res.json({ success: true, uid, message: "Profile created." });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/profile/:uid
router.get("/profile/:uid", async (req, res, next) => {
  try {
    const user = await getDoc("users", req.params.uid);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
