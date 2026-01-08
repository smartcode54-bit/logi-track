"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Truck, Home, LayoutDashboard, Save, ArrowLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { truckSchema, TruckFormValues, truckDefaultValues } from "@/validate/truckSchema";

export default function CreateTruckPage() {
    const router = useRouter();
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

    // Initialize React Hook Form with Zod resolver
    const form = useForm<TruckFormValues>({
        resolver: zodResolver(truckSchema) as any,
        defaultValues: truckDefaultValues,
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages = Array.from(files).map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            setImages((prev) => [...prev, ...newImages]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files) {
            const newImages = Array.from(files)
                .filter((file) => file.type.startsWith("image/"))
                .map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                }));
            setImages((prev) => [...prev, ...newImages]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    // Form submission handler
    const onSubmit = (data: TruckFormValues) => {
        // TODO: Save truck to Firestore
        console.log("Form submitted:", data);
        console.log("Images:", images);
        router.push("/admin/trucks");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb Navigation */}
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/" className="flex items-center gap-1">
                                    <Home className="h-4 w-4 hover:text-green-600 transition-colors" />
                                    Home
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/dashboard" className="flex items-center gap-1">
                                    <LayoutDashboard className="h-4 w-4 hover:text-green-600 transition-colors" />
                                    Dashboard
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/trucks" className="flex items-center gap-1">
                                    <Truck className="h-4 w-4 hover:text-green-600 transition-colors" />
                                    Trucks
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>New Truck</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Add New Truck
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Add a new truck to your fleet
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/trucks" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                {/* Form with React Hook Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Vehicle Identification */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground border-b pb-2">Vehicle Identification</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="licensePlate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>License Plate *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., กข 1234" {...field} />
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
                                            <FormLabel>Province *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select province" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Bangkok">Bangkok</SelectItem>
                                                    <SelectItem value="Chiang Mai">Chiang Mai</SelectItem>
                                                    <SelectItem value="Phuket">Phuket</SelectItem>
                                                    <SelectItem value="Khon Kaen">Khon Kaen</SelectItem>
                                                    <SelectItem value="Chonburi">Chonburi</SelectItem>
                                                    <SelectItem value="Nakhon Ratchasima">Nakhon Ratchasima</SelectItem>
                                                    <SelectItem value="Songkhla">Songkhla</SelectItem>
                                                    <SelectItem value="Udon Thani">Udon Thani</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="plateNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Plate Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 1กข 1234" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>VIN *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 1HGBH41JXMN109186" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="engineNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Engine Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 4D56-ABC123" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="truckStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Truck Status *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select truck status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                    <SelectItem value="insurance-claim">Insurance Claim</SelectItem>
                                                    <SelectItem value="sold">Sold</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Vehicle Details */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground border-b pb-2">Vehicle Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Brand *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Isuzu" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="model"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Model *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., ELF" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" placeholder="e.g., 2023" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Color</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., White" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Truck Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select truck type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="4 Wheels">4 Wheels</SelectItem>
                                                    <SelectItem value="6 Wheels">6 Wheels</SelectItem>
                                                    <SelectItem value="10 Wheels">10 Wheels</SelectItem>
                                                    <SelectItem value="18 Wheels">18 Wheels</SelectItem>
                                                    <SelectItem value="Pickup">Pickup</SelectItem>
                                                    <SelectItem value="Van">Van</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="seats"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Seats</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    max="10"
                                                    step="1"
                                                    placeholder="e.g., 3" 
                                                    value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Only allow positive numbers 0-10 or empty string
                                                        if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 10)) {
                                                            field.onChange(value);
                                                        }
                                                    }}
                                                    onBlur={field.onBlur}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Engine & Capacity */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground border-b pb-2">Engine & Capacity</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="fuelType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fuel Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select fuel type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Diesel">Diesel</SelectItem>
                                                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                                                    <SelectItem value="NGV">NGV</SelectItem>
                                                    <SelectItem value="Electric">Electric</SelectItem>
                                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="engineCapacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Engine Capacity (cc)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    step="1"
                                                    placeholder="e.g., 3000" 
                                                    value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Only allow positive numbers or empty string
                                                        if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                                                            field.onChange(value === "" ? undefined : Number(value));
                                                        }
                                                    }}
                                                    onBlur={field.onBlur}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fuelCapacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fuel Capacity (liters)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    step="1"
                                                    placeholder="e.g., 200" 
                                                    value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Only allow positive numbers or empty string
                                                        if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                                                            field.onChange(value === "" ? undefined : Number(value));
                                                        }
                                                    }}
                                                    onBlur={field.onBlur}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maxLoadWeight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Load Weight (kg)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    step="1"
                                                    placeholder="e.g., 5000" 
                                                    value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Only allow positive numbers or empty string
                                                        if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                                                            field.onChange(value === "" ? undefined : Number(value));
                                                        }
                                                    }}
                                                    onBlur={field.onBlur}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Registration & Purchase */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground border-b pb-2">Registration & Purchase</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="registrationDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registration Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="buyingDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Buying Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="driver"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assigned Driver</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., John Smith" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes about this truck..."
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Truck Photos */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Truck Photos</h2>

                            {/* Image Preview Grid */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image.preview}
                                                alt={`Truck photo ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Area */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
                            >
                                <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-2">
                                    Drag and drop images here, or click to select
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    PNG, JPG or WEBP (max 5MB each)
                                </p>
                                <label className="cursor-pointer">
                                    <Button type="button" variant="outline" asChild>
                                        <span>Choose Files</span>
                                    </Button>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/trucks">Cancel</Link>
                            </Button>
                            <Button type="submit" className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                Save Truck
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
