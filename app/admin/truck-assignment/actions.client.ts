import { db } from "@/firebase/client";
import { collection, query, where, getDocs, addDoc, orderBy, limit, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/collections";

export interface AssignmentData {
    id: string;
    truckId: string;
    driverId: string;
    driverName: string;
    truckPlate: string;
    truckModel: string;
    status: 'active' | 'completed' | 'cancelled';
    adminName: string;
    createdAt: Date;
    completedAt?: Date;
}

export interface DriverOption {
    id: string;
    name: string;
    licenseNumber?: string;
    status: 'available' | 'assigned';
}

export interface TruckOption {
    id: string;
    plate: string;
    model: string;
    status: 'available' | 'assigned' | 'maintenance';
}

export async function getActiveAssignments(): Promise<AssignmentData[]> {
    try {
        const q = query(
            collection(db, COLLECTIONS.ASSIGNMENTS),
            where("status", "==", "active"),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as Timestamp).toDate(),
            completedAt: doc.data().completedAt ? (doc.data().completedAt as Timestamp).toDate() : undefined
        })) as AssignmentData[];
    } catch (error) {
        console.error("Error fetching active assignments:", error);
        return [];
    }
}

export async function getRecentHistory(): Promise<AssignmentData[]> {
    try {
        const q = query(
            collection(db, COLLECTIONS.ASSIGNMENTS),
            orderBy("createdAt", "desc"),
            limit(20)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as Timestamp).toDate(),
            completedAt: doc.data().completedAt ? (doc.data().completedAt as Timestamp).toDate() : undefined
        })) as AssignmentData[];
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
}

export async function getAvailableDrivers(): Promise<DriverOption[]> {
    try {
        // Fetch users with role 'driver' (assuming 'role' field exists on user doc)
        // Adjust query if customClaims structure is strictly needed, but client SDK usually queries doc fields
        const q = query(collection(db, COLLECTIONS.USERS), where("role", "==", "driver"));
        const snapshot = await getDocs(q);

        // In a real app, we'd cross-reference with active assignments to mark status
        // For now, we'll fetch all drivers and let the UI or a secondary check handle availability
        return snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().displayName || "Unknown Driver",
            licenseNumber: doc.data().licenseNumber,
            status: 'available' // Placeholder
        }));
    } catch (error) {
        console.error("Error fetching drivers:", error);
        return [];
    }
}

export async function getAvailableTrucks(): Promise<TruckOption[]> {
    try {
        const q = query(collection(db, COLLECTIONS.TRUCKS), where("truckStatus", "==", "active"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            plate: doc.data().licensePlate,
            model: doc.data().model,
            status: 'available' // Placeholder
        }));
    } catch (error) {
        console.error("Error fetching trucks:", error);
        return [];
    }
}

export async function createAssignment(data: Omit<AssignmentData, "id" | "createdAt" | "status">) {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.ASSIGNMENTS), {
            ...data,
            status: 'active',
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating assignment:", error);
        throw error;
    }
}
