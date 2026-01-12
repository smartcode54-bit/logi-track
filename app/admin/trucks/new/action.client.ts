import { db } from "@/firebase/client";
import { collection, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { truckSchema } from "@/validate/truckSchema";
import * as z from "zod";

export const saveNewTruckToFirestoreClient = async (
    data: z.infer<typeof truckSchema>,
    userId: string
) => {
    try {
        console.log("[saveNewTruckToFirestoreClient] Starting save process...");

        // Create the truck document
        console.log("[saveNewTruckToFirestoreClient] Creating truck document...");
        const trucksRef = collection(db, "trucks");
        const docRef = await addDoc(trucksRef, {
            ...data,
            createdBy: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        const truckId = docRef.id;
        console.log("[saveNewTruckToFirestoreClient] Created truck with ID:", truckId);

        console.log("✅ Truck saved successfully:", {
            truckId: truckId,
            userId: userId,
        });

        return {
            success: true,
            truckId: truckId
        };
    } catch (error: any) {
        console.error("❌ Error saving truck:", error);
        throw error;
    }
};

export const updateTruckInFirestoreClient = async (
    truckId: string,
    data: z.infer<typeof truckSchema>,
    userId: string
) => {
    try {
        console.log("[updateTruckInFirestoreClient] Starting update process...");

        // Prepare truck data for Firestore
        const truckData: Record<string, any> = {
            ...data,
            updatedAt: serverTimestamp(),
            updatedBy: userId,
        };

        console.log("[updateTruckInFirestoreClient] Updating truck in Firestore...");
        const truckRef = doc(db, "trucks", truckId);
        await updateDoc(truckRef, truckData);

        console.log("✅ Truck updated successfully:", {
            truckId: truckId,
            userId: userId,
        });

        return {
            success: true,
            truckId: truckId
        };
    } catch (error) {
        console.error("❌ Error updating truck:", error);
        throw error;
    }
};
