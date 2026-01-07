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
        const adminEmails = process.env.SYSTEM_ADMIN_EMAILS?.split(",").map(email => email.trim()) || [];
        
        
        if (userRecord.email && adminEmails.includes(userRecord.email) && !userRecord.customClaims?.admin) {
            
            await auth.setCustomUserClaims(verifiedToken.uid, {
                admin: true,
            });
            
        } else if (userRecord.email && adminEmails.includes(userRecord.email) && userRecord.customClaims?.admin) {
            
        } else {
            
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