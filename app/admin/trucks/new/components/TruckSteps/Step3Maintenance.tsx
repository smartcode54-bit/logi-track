"use client";

import { useFormContext } from "react-hook-form";
import { TruckFormValues } from "@/validate/truckSchema";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EngineInformationSection } from "../EngineCapacitySection";
import { VehicleDetailsSection } from "../VehicleDetailsSection";

export function Step3Maintenance() {
    const form = useFormContext<TruckFormValues>();
    const ownershipType = form.watch("ownershipType");

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-medium mb-1">Step 3: Maintenance & Performance</h3>
                <p className="text-sm text-muted-foreground mb-6">Details regarding engine specifications and current operational status.</p>

                {/* Truck Status */}
                <div className="mb-6">
                    <FormField
                        control={form.control}
                        name="truckStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active (Operational)</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="maintenance">Under Maintenance</SelectItem>
                                        <SelectItem value="insurance-claim">Insurance Claim</SelectItem>
                                        <SelectItem value="sold">Sold / Decommissioned</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Engine Details - Reuse existing */}
                {ownershipType === 'own' ? (
                    <EngineInformationSection />
                ) : (
                    <div className="p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
                        Detailed engine information is optional for subcontractor trucks.
                    </div>
                )}
            </div>

            {/* Additional Vehicle Details reuse */}
            <div className="bg-card border rounded-lg p-6 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
                <VehicleDetailsSection />
            </div>
        </div>
    );
}
