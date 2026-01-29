"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/language";
import { getTruckByIdClient, TruckData } from "../../actions.client";
import { updateTruckInFirestoreClient, uploadTruckFile } from "../../new/action.client";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, FileText, Wrench, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatLicensePlate } from "@/lib/utils";
import { TruckValidatedData } from "@/validate/truckSchema";

const SERVICE_TYPES = [
    { value: "oil_change", label: "Oil Change" },
    { value: "tire_rotation", label: "Tire Rotation" },
    { value: "brake_service", label: "Brake Service" },
    { value: "full_service", label: "Full Service" },
    { value: "engine_repair", label: "Engine Repair" },
    { value: "transmission", label: "Transmission Service" },
    { value: "battery", label: "Battery Replacement" },
    { value: "insurance_claim", label: "Insurance Claim" },
    { value: "other", label: "Other" },
];

export default function MaintenanceClient() {
    const { t } = useLanguage();
    const params = useParams();
    const router = useRouter();
    const auth = useAuth();
    const currentUser = auth?.currentUser;
    const id = params?.id as string;

    const [truck, setTruck] = useState<TruckData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [currentMileage, setCurrentMileage] = useState<string>("");
    const [serviceType, setServiceType] = useState<string>("");
    const [serviceDate, setServiceDate] = useState<string>("");
    const [nextServiceDate, setNextServiceDate] = useState<string>("");
    const [nextServiceMileage, setNextServiceMileage] = useState<string>("");
    const [serviceCost, setServiceCost] = useState<string>("");
    const [serviceProvider, setServiceProvider] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingFileUrl, setExistingFileUrl] = useState<string | undefined>();

    useEffect(() => {
        async function fetchTruck() {
            setLoading(true);
            try {
                const data = await getTruckByIdClient(id);
                setTruck(data);
                // Initialize form with existing values
                if (data) {
                    const currentKm = data.currentMileage || 0;
                    setCurrentMileage(currentKm.toString());
                    setNextServiceDate(data.nextServiceDate || "");
                    // Auto-calculate next service mileage: current + 20000 km
                    const calculatedNextMileage = currentKm + 20000;
                    setNextServiceMileage(data.nextServiceMileage?.toString() || calculatedNextMileage.toString());
                    // Set today's date as default service date
                    setServiceDate(new Date().toISOString().split('T')[0]);
                }
            } catch (error) {
                console.error("Failed to fetch truck", error);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchTruck();
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !truck) return;

        setIsSubmitting(true);

        try {
            // Upload file if selected
            let newFileUrl = existingFileUrl;
            if (selectedFile) {
                const path = `trucks/documents/maintenance/${Date.now()}_${selectedFile.name}`;
                newFileUrl = await uploadTruckFile(selectedFile, path);
            }

            const updatePayload: Partial<TruckValidatedData> = {
                lastServiceDate: serviceDate,
            };

            // Update mileage if provided
            if (currentMileage) {
                updatePayload.currentMileage = parseFloat(currentMileage);
            }

            // Update next service info
            if (nextServiceDate) {
                updatePayload.nextServiceDate = nextServiceDate;
            }
            if (nextServiceMileage) {
                updatePayload.nextServiceMileage = parseFloat(nextServiceMileage);
            }

            await updateTruckInFirestoreClient(truck.id, updatePayload as TruckValidatedData, currentUser.uid);

            // Redirect back to truck list
            router.push('/admin/trucks');

        } catch (error) {
            console.error("Error updating maintenance:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!truck) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <p className="text-xl font-semibold">{t("Truck not found")}</p>
                <Button variant="outline" onClick={() => router.back()}>
                    {t("Go Back")}
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t("Record Maintenance")}</h1>
                    <p className="text-muted-foreground">
                        {truck.brand} {truck.model} - <span className="font-mono font-medium text-foreground">{formatLicensePlate(truck.licensePlate)}</span>
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border-t-4 border-t-yellow-500/50 shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-yellow-500" />
                                {t("Service Record")}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {t("Last Service")}: <span className="font-semibold text-foreground">
                                    {truck.lastServiceDate || "-"}
                                </span>
                                {" | "}
                                {t("Current Mileage")}: <span className="font-semibold text-foreground">
                                    {truck.currentMileage?.toLocaleString() || "0"} km
                                </span>
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                            {truck.truckStatus || "Active"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Row 1: Mileage & Service Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>{t("Current Mileage (km)")}</Label>
                                <Input
                                    type="number"
                                    value={currentMileage}
                                    onChange={(e) => {
                                        const newMileage = e.target.value;
                                        setCurrentMileage(newMileage);
                                        // Auto-update next service mileage (+20000 km)
                                        if (newMileage) {
                                            setNextServiceMileage((parseFloat(newMileage) + 20000).toString());
                                        }
                                    }}
                                    placeholder="e.g., 125000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("Service Type")}</Label>
                                <Select value={serviceType} onValueChange={setServiceType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("Select service type")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SERVICE_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {t(type.label)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 2: Service Date & Cost */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>{t("Service Date")}</Label>
                                <Input
                                    type="date"
                                    value={serviceDate}
                                    onChange={(e) => setServiceDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("Service Cost (THB)")}</Label>
                                <Input
                                    type="number"
                                    value={serviceCost}
                                    onChange={(e) => setServiceCost(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Row 3: Next Service Mileage (auto-calculated) */}
                        <div className="space-y-2">
                            <Label>{t("Next Service Mileage (km)")}</Label>
                            <Input
                                type="number"
                                value={nextServiceMileage}
                                readOnly
                                disabled
                                className="bg-muted/50 max-w-xs"
                                placeholder="Auto-calculated"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("Auto-calculated: Current Mileage + 20,000 km")}
                            </p>
                        </div>

                        {/* Row 4: Service Provider */}
                        <div className="space-y-2">
                            <Label>{t("Service Provider")}</Label>
                            <Input
                                value={serviceProvider}
                                onChange={(e) => setServiceProvider(e.target.value)}
                                placeholder={t("Garage / Mechanic name")}
                            />
                        </div>

                        {/* Row 5: Notes */}
                        <div className="space-y-2">
                            <Label>{t("Notes")}</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t("Additional notes about the service...")}
                            />
                        </div>

                        {/* Row 6: Document Upload */}
                        <div className="space-y-3">
                            <Label>{t("Receipt / Document")}</Label>
                            {existingFileUrl ? (
                                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/20">
                                    <FileText className="h-8 w-8 text-blue-500" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium truncate">{t("Uploaded Document")}</p>
                                        <a href={existingFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                            {t("View / Download")}
                                        </a>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setExistingFileUrl(undefined)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        {t("Replace")}
                                    </Button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-input hover:bg-muted/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer text-muted-foreground relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept="image/*,application/pdf"
                                    />
                                    <Upload className="h-8 w-8" />
                                    <span className="text-sm font-medium">{selectedFile ? selectedFile.name : t("Click to upload Receipt / Document")}</span>
                                    {!selectedFile && <span className="text-xs text-muted-foreground/75">PDF, JPG, PNG up to 10MB</span>}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button type="button" variant="ghost" onClick={() => router.back()}>
                                {t("Cancel")}
                            </Button>
                            <Button
                                type="submit"
                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                disabled={isSubmitting || !serviceDate}
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {t("Save Service Record")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
