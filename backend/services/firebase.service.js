const admin = require("firebase-admin");

let initialized = false;

/**
 * Initializes Firebase Admin SDK (singleton).
 * Uses service account from environment variable.
 */
const initFirebase = () => {
  if (initialized) return admin;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  initialized = true;
  console.log("✅ Firebase Admin SDK initialized");
  return admin;
};

const getFirestore = () => {
  initFirebase();
  return admin.firestore();
};

// ─── Firestore Helpers ────────────────────────────────────────────────────────

/**
 * Gets a document and returns data or null.
 */
const getDoc = async (collection, docId) => {
  const db = getFirestore();
  const ref = db.collection(collection).doc(docId);
  const snap = await ref.get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Sets (upserts) a document.
 */
const setDoc = async (collection, docId, data) => {
  const db = getFirestore();
  await db
    .collection(collection)
    .doc(docId)
    .set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
};

/**
 * Verifies Firebase ID token from Authorization header.
 */
const verifyToken = async (token) => {
  initFirebase();
  return admin.auth().verifyIdToken(token);
};

module.exports = { initFirebase, getFirestore, getDoc, setDoc, verifyToken };
