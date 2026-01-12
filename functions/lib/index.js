"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdminStatus = exports.setAdminClaims = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const options_1 = require("firebase-functions/v2/options");
// Set global options for all functions
(0, options_1.setGlobalOptions)({
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
exports.setAdminClaims = (0, https_1.onCall)(async (request) => {
    // Ensure user is authenticated
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
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
        }
        catch (error) {
            console.error(`[setAdminClaims] Error setting admin claim:`, error);
            throw new https_1.HttpsError("internal", "Failed to set admin claim");
        }
    }
    else {
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
exports.checkAdminStatus = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
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
    }
    catch (error) {
        console.error(`[checkAdminStatus] Error:`, error);
        throw new https_1.HttpsError("internal", "Failed to check admin status");
    }
});
//# sourceMappingURL=index.js.map