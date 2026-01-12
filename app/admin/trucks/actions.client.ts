import { db } from "@/firebase/client";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";

export interface TruckData {
    id: string;
    licensePlate: string;
    province: string;
    vin: string;
    engineNumber: string;
    truckStatus: string;
    brand: string;
    model: string;
    year: string;
    color: string;
    type: string;
    seats?: string;
    fuelType: string;
    engineCapacity?: number;
    fuelCapacity?: number;
    maxLoadWeight?: number;
    registrationDate: string;
    buyingDate: string;
    driver: string;
    notes?: string;
    images?: string[];
    createdBy: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}

// Convert Firestore Timestamp to Date or keep as is
const formatTimestamp = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (timestamp.toDate) {
        return timestamp.toDate();
    }
    if (timestamp.toMillis) {
        return new Date(timestamp.toMillis());
    }
    if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000);
    }
    return timestamp;
};

export async function getTrucksClient(): Promise<TruckData[]> {
    try {
        // Get trucks from Firestore using client SDK
        const trucksRef = collection(db, "trucks");
        const q = query(trucksRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const trucks: TruckData[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            trucks.push({
                id: doc.id,
                licensePlate: data.licensePlate || "",
                province: data.province || "",
                vin: data.vin || "",
                engineNumber: data.engineNumber || "",
                truckStatus: data.truckStatus || "",
                brand: data.brand || "",
                model: data.model || "",
                year: data.year || "",
                color: data.color || "",
                type: data.type || "",
                seats: data.seats || "",
                fuelType: data.fuelType || "",
                engineCapacity: data.engineCapacity,
                fuelCapacity: data.fuelCapacity,
                maxLoadWeight: data.maxLoadWeight,
                registrationDate: data.registrationDate || "",
                buyingDate: data.buyingDate || "",
                driver: data.driver || "",
                notes: data.notes || "",
                images: data.images || [],
                createdBy: data.createdBy || "",
                createdAt: formatTimestamp(data.createdAt),
                updatedAt: formatTimestamp(data.updatedAt),
            });
        });

        return trucks;
    } catch (error) {
        console.error("Error fetching trucks:", error);
        throw error;
    }
}

export async function getTruckByIdClient(id: string): Promise<TruckData | null> {
    try {
        // Get truck from Firestore using client SDK
        const truckRef = doc(db, "trucks", id);
        const docSnap = await getDoc(truckRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();

        return {
            id: docSnap.id,
            licensePlate: data.licensePlate || "",
            province: data.province || "",
            vin: data.vin || "",
            engineNumber: data.engineNumber || "",
            truckStatus: data.truckStatus || "",
            brand: data.brand || "",
            model: data.model || "",
            year: data.year || "",
            color: data.color || "",
            type: data.type || "",
            seats: data.seats || "",
            fuelType: data.fuelType || "",
            engineCapacity: data.engineCapacity,
            fuelCapacity: data.fuelCapacity,
            maxLoadWeight: data.maxLoadWeight,
            registrationDate: data.registrationDate || "",
            buyingDate: data.buyingDate || "",
            driver: data.driver || "",
            notes: data.notes || "",
            images: data.images || [],
            createdBy: data.createdBy || "",
            createdAt: formatTimestamp(data.createdAt),
            updatedAt: formatTimestamp(data.updatedAt),
        };
    } catch (error) {
        console.error("Error fetching truck:", error);
        throw error;
    }
}
