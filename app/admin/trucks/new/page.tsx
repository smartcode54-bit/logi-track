"use client";

import { useState } from "react";


import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { THAILAND_PROVINCES } from "@/lib/constants";
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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { truckSchema, TruckFormValues, truckDefaultValues } from "@/validate/truckSchema";
import { useLanguage } from "@/context/language";

export default function CreateTruckPage() {
    const router = useRouter();
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

    const { t } = useLanguage();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => (currentYear - i).toString());

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
                                    {t("nav.home")}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/dashboard" className="flex items-center gap-1">
                                    <LayoutDashboard className="h-4 w-4 hover:text-green-600 transition-colors" />
                                    {t("nav.dashboard")}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/trucks" className="flex items-center gap-1">
                                    <Truck className="h-4 w-4 hover:text-green-600 transition-colors" />
                                    {t("trucks.title")}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{t("New Truck")}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {t("New Truck")}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {t("Add a new truck")}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/trucks" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            {t("back to Trucks")}
                        </Link>
                    </Button>
                </div>

                {/* Form with React Hook Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Vehicle Identification */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground border-b pb-2">{t("identification")}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="licensePlate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("licensePlate")} *</FormLabel>
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
                                            <FormLabel>{t("province")} *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select province" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {THAILAND_PROVINCES.map((province) => (
                                                        <SelectItem key={province} value={province}>
                                                            {province}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="vin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("vin")} *</FormLabel>
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
                                            <FormLabel>{t("engineNumber")} *</FormLabel>
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
                                            <FormLabel>{t("truckStatus")} *</FormLabel>
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
                            <h2 className="text-lg font-semibold text-foreground border-b pb-2">{t("details")}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("brand")} *</FormLabel>
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
                                            <FormLabel>{t("model")} *</FormLabel>
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
                                            <FormLabel>{t("year")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select year" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year} value={year}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("color")}</FormLabel>
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
                                            <FormLabel>{t("truckType")} *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select truck type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Pickup">Pickup</SelectItem>
                                                    <SelectItem value="4 Wheels">4 Wheels</SelectItem>
                                                    <SelectItem value="6 Wheels">6 Wheels</SelectItem>
                                                    <SelectItem value="10 Wheels">10 Wheels</SelectItem>
                                                    <SelectItem value="18 Wheels">18 Wheels</SelectItem>
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
                                            <FormLabel>{t("seats")}</FormLabel>
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
                            <h2 className="text-lg font-semibold text-foreground border-b pb-2">{t("engine")}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="fuelType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("fuelType")} *</FormLabel>
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
                                            <FormLabel>{t("engine Capacity")}</FormLabel>
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
                                            <FormLabel>{t("fuel Capacity")}</FormLabel>
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
                                            <FormLabel>{t("max Load Weight")}</FormLabel>
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
                            <h2 className="text-lg font-semibold text-foreground border-b pb-2">{t("trucks.new.section.registration")}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="registrationDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("registration Date")}</FormLabel>
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
                                            <FormLabel>{t("buying Date")}</FormLabel>
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
                                            <FormLabel>{t("driver")}</FormLabel>
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
                                    <FormLabel>{t("notes")}</FormLabel>
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
                            <h2 className="text-lg font-semibold text-foreground">{t("photos")}</h2>

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
                                    {t("Drag and drop files here or")}
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    {t("Browse image from your device")}
                                </p>
                                <label className="cursor-pointer">
                                    <Button type="button" variant="outline" asChild>
                                        <span>{t("Browse")}</span>
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
                                <Link href="/admin/trucks">{t("Cancel")}</Link>
                            </Button>
                            <Button type="submit" className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                {t("Save")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
