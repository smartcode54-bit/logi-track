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
import { PhotosSection } from "../PhotosSection";

// We can reuse the PhotosSection or inline it if simpler for the step. 
// Reusing it keeps the logic consistent.

interface Step1Props {
    onFileSelect: (field: string, file: File, blobUrl: string) => void;
}

export function Step1Specs({ onFileSelect }: Step1Props) {
    const form = useFormContext<TruckFormValues>();

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-medium mb-1">Step 1: Vehicle Specifications</h3>
                <p className="text-sm text-muted-foreground mb-6">Provide the basic identifying information for the asset.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Make / Brand */}
                    <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Make</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Make" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {/* Mock Data for Makes */}
                                        {["Volvo", "Scania", "Isuzu", "Hino", "Mercedes-Benz", "UD Trucks"].map((brand) => (
                                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Model */}
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. VNL 860" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Manufacturing Year */}
                    <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Manufacturing Year</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="2024" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Truck Type */}
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Truck Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {/* Mock Data for Truck Types */}
                                        {["Flatbed", "Box Truck", "Refrigerated", "Tanker", "Dump Truck"].map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* VIN */}
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="vin"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Vehicle Identification Number (VIN)</FormLabel>
                                        <span className="text-xs text-muted-foreground">17 characters</span>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="ENTER 17-DIGIT VIN"
                                            className="font-mono uppercase"
                                            maxLength={17}
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </FormControl>
                                    {field.value && field.value.length !== 17 && (
                                        <p className="text-[0.8rem] font-medium text-destructive mt-1">VIN must be exactly 17 characters long.</p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* License Plate & Province */}
                    <FormField
                        control={form.control}
                        name="licensePlate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vehicle Plate Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="E.G. ABC-1234" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Province</FormLabel>
                                <FormControl>
                                    <Input placeholder="Bangkok" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Vehicle Appearance / Photos */}
            {/* Reuse existing component but wrap it to match style if needed */}
            <div className="bg-card border rounded-lg p-6 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Vehicle Appearance</h3>
                <PhotosSection onFileSelect={onFileSelect} />
            </div>
        </div>
    );
}
