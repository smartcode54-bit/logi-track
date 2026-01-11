"use server";

import { truckSchema } from "@/validate/truckSchema";
import * as z from "zod";
import { firestoreTrucks, auth } from "@/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

export const saveNewTruckToFirestore = async (
    data: z.infer<typeof truckSchema>, 
    images: { file: File; preview: string }[], 
    token: string
) => {
    try {
        console.log("[saveNewTruckToFirestore] Starting save process...");
        
        // Validate token
        if (!token) {
            throw new Error("Unauthorized: No authentication token found");
        }

        // Verify token
        console.log("[saveNewTruckToFirestore] Verifying token...");
        const verifiedToken = await auth.verifyIdToken(token);
        console.log("[saveNewTruckToFirestore] Token verified, user ID:", verifiedToken.uid);
        console.log("[saveNewTruckToFirestore] Admin claim:", verifiedToken.admin);
        
        // Check if user is admin from token claims
        if (verifiedToken.admin !== true) {
            throw new Error("Forbidden: Admin access required");
        }

        // Prepare truck data for Firestore
        // Note: Images upload will be implemented later
        const truckData = {
            ...data,
            images: [], // Empty array for now, will be populated when image upload is implemented
            createdBy: verifiedToken.uid,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        console.log("[saveNewTruckToFirestore] Prepared truck data:", {
            ...truckData,
            createdAt: "[ServerTimestamp]",
            updatedAt: "[ServerTimestamp]"
        });

        // Save to Firestore
        try {
            console.log("[saveNewTruckToFirestore] Attempting to save to Firestore...");
            // Use the "trucks" database (not default)
            const trucksRef = firestoreTrucks.collection("trucks");
            const docRef = await trucksRef.add(truckData);
            
            console.log("✅ Truck saved successfully:", {
                truckId: docRef.id,
                userId: verifiedToken.uid,
                imagesCount: images.length,
            });

            // Return success with truck ID
            return { 
                success: true, 
                truckId: docRef.id 
            };
        } catch (firestoreError: any) {
            console.error("❌ Firestore error details:", {
                code: firestoreError?.code,
                message: firestoreError?.message,
                details: firestoreError?.details,
                stack: firestoreError?.stack,
            });
            
            // Provide helpful error message for NOT_FOUND error
            if (firestoreError?.code === 5 || firestoreError?.code === 'NOT_FOUND') {
                throw new Error(
                    'Firestore database not found. Please ensure:\n' +
                    '1. Firestore Database is created in Firebase Console\n' +
                    '2. Firestore is enabled for your project\n' +
                    '3. Service account has proper permissions\n' +
                    '4. Project ID is correct: logi-track-wrt-dev'
                );
            }
            
            throw new Error(`Failed to save truck to Firestore: ${firestoreError?.message || 'Unknown error'}`);
        }

        
    } catch (error) {
        console.error("❌ Error saving truck:", error);
        throw error;
    }
}
