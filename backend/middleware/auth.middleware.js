const admin = require("firebase-admin");

/**
 * Express middleware to authenticate users via Firebase JWT
 * Validates the Bearer token in the Authorization header.
 * 
 * If valid, attaches the decoded user object to `req.user`
 * If invalid, returns a generic 401 Unauthorized to avoid data leaks.
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or invalid token format",
      });
    }

    const token = authHeader.split("Bearer ")[1];
    
    // Verify the Firebase JWT Token securely
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    
    next();
  } catch (error) {
    // Log suspicious activity internally, return generic error to user
    console.warn(`[Security] JWT Validation Failed: ${error.message}`);
    
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

module.exports = { requireAuth };
