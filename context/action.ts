"use server";

import { auth } from "@/firebase/server";
import { cookies } from "next/headers";

export const removeToken = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("firebase_token");
    cookieStore.delete("firebase_refresh_token");
};

// Rotate tokens: Refresh ID token using refresh token
export const rotateToken = async (newIdToken: string) => {
    try {
        const verifiedToken = await auth.verifyIdToken(newIdToken);
        if (!verifiedToken) {
            return;
        }
        
        const cookieStore = await cookies();
        // Update ID token with new one (keep same expiration)
        cookieStore.set("firebase_token", newIdToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60, // 1 hour
        });
    } catch (error) {
        console.error("Error refreshing token:", error);
        throw error;
    }
};
export const setToken = async ({
     token,
     refreshToken,
}: {
     token: string;
     refreshToken: string;
}) => {
    try {
        const verifiedToken = await auth.verifyIdToken(token);
        if (!verifiedToken) {
            return;
        }
        const userRecord = await auth.getUser(verifiedToken.uid);
        
        // Check if user email is in admin emails list
        // Support both SYSTEM_ADMIN_EMAILS and FIREBASE_SYSTEM_ADMIN for backward compatibility
        const adminEmailsString = process.env.SYSTEM_ADMIN_EMAILS || process.env.FIREBASE_SYSTEM_ADMIN || "";
        const adminEmails = adminEmailsString
            .replace(/["']/g, "") // Remove quotes if present
            .split(",")
            .map(email => email.trim())
            .filter(email => email.length > 0);
        
        console.log("[setToken] Admin emails from env:", adminEmails);
        console.log("[setToken] User email:", userRecord.email);
        console.log("[setToken] Current claims:", userRecord.customClaims);
        
        if (userRecord.email && adminEmails.includes(userRecord.email)) {
            if (!userRecord.customClaims?.admin) {
                console.log("[setToken] Setting admin claim for:", userRecord.email);
                await auth.setCustomUserClaims(verifiedToken.uid, {
                    admin: true,
                });
                console.log("[setToken] Admin claim set successfully");
            } else {
                console.log("[setToken] User already has admin claim");
            }
        } else {
            console.log("[setToken] User email not in admin list or email not found");
        }
        const cookieStore = await cookies();
        
        // ID Token: Short-lived (1 hour) - Firebase ID tokens expire in ~1 hour
        cookieStore.set("firebase_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60, // 1 hour (3600 seconds)
        });
        
        // Refresh Token: Long-lived (30 days) - More secure with strict SameSite
        cookieStore.set("firebase_refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // More secure for refresh tokens
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days (2592000 seconds)
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}