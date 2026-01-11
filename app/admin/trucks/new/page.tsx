"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck, Home, LayoutDashboard, Save, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Form } from "@/components/ui/form";
import { useLanguage } from "@/context/language";
import { truckSchema, TruckFormValues, truckDefaultValues } from "@/validate/truckSchema";
import * as z from "zod";

import { IdentificationSection } from "./components/IdentificationSection";
import { VehicleDetailsSection } from "./components/VehicleDetailsSection";
import { RegistrationSection } from "./components/RegistrationSection";
import { PhotosSection } from "./components/PhotosSection";
import { EngineInformationSection } from "./components/EngineCapacitySection";

export default function CreateTruckPage() {
    const router = useRouter();
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { t } = useLanguage();

    // Initialize React Hook Form with Zod resolver
    const form = useForm<TruckFormValues>({
        resolver: zodResolver(truckSchema) as any, // Type assertion needed due to transform in schema
        defaultValues: truckDefaultValues,
    });

    // Form submission handler
    const onSubmit = async (data: z.infer<typeof truckSchema>) => {
        setIsSubmitting(true);
        setError(null);
        try {
            // Log form data to console
            console.log("=== Form Submitted ===");
            console.log("Form Data:", JSON.stringify(data, null, 2));
            console.log("Images Count:", images.length);
            if (images.length > 0) {
                console.log("Images:", images.map(img => ({
                    name: img.file.name,
                    size: img.file.size,
                    type: img.file.type,
                    preview: img.preview
                })));
            }
            console.log("====================");
            
            // TODO: Save truck to Firestore
            // await saveTruckToFirestore(data, images);
            
            // Show success and redirect
            router.push("/admin/trucks");
        } catch (error) {
            console.error("Error saving truck:", error);
            const errorMessage = error instanceof Error 
                ? error.message 
                : "Failed to save truck. Please try again.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
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
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md border border-destructive/50">
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        <IdentificationSection />
                        <VehicleDetailsSection />
                        <EngineInformationSection />
                        <RegistrationSection />
                        <PhotosSection images={images} setImages={setImages} />

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/trucks">{t("Cancel")}</Link>
                            </Button>
                            <Button 
                                type="submit" 
                                className="flex items-center gap-2"
                                disabled={isSubmitting}
                            >
                                <Save className="h-4 w-4" />
                                {isSubmitting ? t("common.loading") || "Saving..." : t("Save")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
