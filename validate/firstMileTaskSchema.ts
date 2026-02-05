import { z } from "zod";

export const SOC_DESTINATIONS = {
    "SOC-E": "SOC-E (Bueroi)",
    "SOC-N": "SOC-N (Wang Noi)",
    "SOC-W": "SOC-W (Samut Sakhon)"
} as const;

export const SOC_KEYS = ["SOC-E", "SOC-N", "SOC-W"] as const;

export const FIRST_MILE_STATUS_ENUM = ["Pending", "Assigned", "In-Transit", "Completed", "Cancelled"] as const;

export const firstMileTaskSchema = z.object({
    id: z.string().optional(),

    // Time & Location
    date: z.date({
        required_error: "Date is required",
        invalid_type_error: "That's not a date!",
    }),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format (e.g. 15:00)"),

    sourceHub: z.string().min(1, "Source Hub is required"), // From SPX_Hub
    destination: z.enum(SOC_KEYS),

    // Vehicle Requirements
    plateType: z.enum(["4WH", "4WJ", "6WH", "Other"]).optional(), // Based on image

    // Shipment Info
    shipmentId: z.string().optional(),

    // Assignment
    driverId: z.string().optional(),
    driverName: z.string().optional(),
    driverPhone: z.string().optional(),
    licensePlate: z.string().optional(),

    status: z.enum(FIRST_MILE_STATUS_ENUM).default("Pending"),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type FirstMileTask = z.infer<typeof firstMileTaskSchema>;
