import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";

// Set global options for all functions
setGlobalOptions({
  region: "asia-southeast1", // Singapore region (closest to Thailand)
  maxInstances: 10,
});

// Initialize Firebase Admin
admin.initializeApp();

// Admin emails - hardcoded for now, can be moved to Firebase Remote Config later
const ADMIN_EMAILS = [
  "radchada67@gmail.com",
  "smartcode54@gmail.com",
];

/**
 * Cloud Function to set admin claims for authorized users
 * This is called from the client when a user signs in
 */
export const setAdminClaims = onCall(async (request) => {
  // Ensure user is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const uid = request.auth.uid;
  const email = request.auth.token.email;

  console.log(`[setAdminClaims] Processing request for user: ${email} (${uid})`);

  // Check if user email is in admin list
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    try {
      // Get current claims
      const user = await admin.auth().getUser(uid);
      const currentClaims = user.customClaims || {};

      // Check if already admin
      if (currentClaims.admin === true) {
        console.log(`[setAdminClaims] User ${email} already has admin claim`);
        return {
          success: true,
          admin: true,
          message: "User already has admin privileges",
        };
      }

      // Set admin claim
      await admin.auth().setCustomUserClaims(uid, {
        ...currentClaims,
        admin: true,
      });

      console.log(`[setAdminClaims] Admin claim set for user: ${email}`);
      return {
        success: true,
        admin: true,
        message: "Admin privileges granted",
      };
    } catch (error) {
      console.error(`[setAdminClaims] Error setting admin claim:`, error);
      throw new HttpsError("internal", "Failed to set admin claim");
    }
  } else {
    console.log(`[setAdminClaims] User ${email} is not in admin list`);
    return {
      success: true,
      admin: false,
      message: "User is not an admin",
    };
  }
});

/**
 * Cloud Function to check if a user has admin privileges
 * Useful for debugging
 */
export const checkAdminStatus = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const uid = request.auth.uid;
  const email = request.auth.token.email;

  try {
    const user = await admin.auth().getUser(uid);
    const claims = user.customClaims || {};

    return {
      email: email,
      isAdmin: claims.admin === true,
      claims: claims,
    };
  } catch (error) {
    console.error(`[checkAdminStatus] Error:`, error);
    throw new HttpsError("internal", "Failed to check admin status");
  }
});
