import * as z from "zod";

// Helper for optional numeric fields to handle empty strings
const optionalNumber = (min: number, max: number, label: string) => 
    z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            if (typeof val === "string") {
                const num = parseFloat(val);
                return isNaN(num) ? undefined : num;
            }
            const num = Number(val);
            return isNaN(num) ? undefined : num;
        },
        z.number()
            .min(min, `${label} must be at least ${min}`)
            .max(max, `${label} cannot exceed ${max}`)
            .refine((val) => val >= 0, `${label} cannot be negative`)
    ).optional();

// Truck form validation schema
export const truckSchema = z.object({
    licensePlate: z.string().min(1, "License plate is required"),
    province: z.string().min(1, "Province is required"),
    plateNumber: z.string().min(1, "Plate number is required"),
    vin: z.string().min(17, "VIN must be 17 characters"),
    engineNumber: z.string().min(1, "Engine number is required"),
    truckStatus: z.enum(["active", "inactive", "maintenance", "insurance-claim", "sold"], {
        message: "Truck status is required",
    }),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().regex(/^\d{4}$/, "Year must be a 4-digit number"),
    color: z.string().min(1, "Color is required"),
    type: z.string().min(1, "Type is required"),
    seats: z.string().refine(v => !v || (parseInt(v) >= 0 && parseInt(v) <= 10), "Seats must be 0-10 and cannot be negative"),
    fuelType: z.string().min(1, "Fuel type is required"),
    engineCapacity: optionalNumber(0, 20000, "Engine capacity"),
    fuelCapacity: optionalNumber(0, 1000, "Fuel capacity"),
    maxLoadWeight: optionalNumber(0, 100000, "Max load weight"),
    registrationDate: z.string().min(1, "Registration date is required"),
    buyingDate: z.string().min(1, "Buying date is required"),
    driver: z.string().min(1, "Driver is required"),
    notes: z.string().optional(),
});

// Type inference from schema
export type TruckFormValues = z.infer<typeof truckSchema>;

// Default values for the form
export const truckDefaultValues: TruckFormValues = {
    licensePlate: "",
    province: "",
    plateNumber: "",
    vin: "",
    engineNumber: "",
    truckStatus: "active",
    brand: "",
    model: "",
    year: "",
    color: "",
    type: "",
    seats: "",
    fuelType: "",
    engineCapacity: undefined,
    fuelCapacity: undefined,
    maxLoadWeight: undefined,
    registrationDate: "",
    buyingDate: "",
    driver: "",
    notes: "",
};
