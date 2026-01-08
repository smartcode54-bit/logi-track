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
import { Truck, Home, LayoutDashboard, Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TrucksListPage() {
    // Mock trucks data - replace with real data from Firestore
    const trucks = [
        {
            id: "1",
            plateNumber: "1กข 1234",
            model: "Isuzu ELF",
            type: "4 Wheels",
            status: "Available",
            driver: "John Smith",
        },
        {
            id: "2",
            plateNumber: "2ขค 5678",
            model: "Hino 500",
            type: "6 Wheels",
            status: "In Transit",
            driver: "Mike Johnson",
        },
        {
            id: "3",
            plateNumber: "3คง 9012",
            model: "Isuzu FTR",
            type: "10 Wheels",
            status: "Available",
            driver: "David Lee",
        },
        {
            id: "4",
            plateNumber: "4งจ 3456",
            model: "Hino 700",
            type: "18 Wheels",
            status: "Maintenance",
            driver: "Tom Wilson",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Available":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "In Transit":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "Maintenance":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
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
                            <BreadcrumbPage className="flex items-center gap-1">
                                <Truck className="h-4 w-4 hover:text-green-600 transition-colors" />
                                Trucks
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Trucks
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your truck fleet
                        </p>
                    </div>
                    <Button asChild className="flex items-center gap-2">
                        <Link href="/admin/trucks/new">
                            <Plus className="h-4 w-4" />
                            Add Truck
                        </Link>
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search trucks..."
                        className="pl-10"
                    />
                </div>

                {/* Trucks List */}
                <div className="space-y-2">
                    {trucks.map((truck) => (
                        <div
                            key={truck.id}
                            className="group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">
                                        {truck.plateNumber}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {truck.model} • {truck.driver}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-sm text-muted-foreground">
                                    {truck.type}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(truck.status)}`}>
                                    {truck.status}
                                </span>
                                <button className="p-2 hover:bg-accent rounded-md transition-colors">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {trucks.length === 0 && (
                    <div className="text-center py-12">
                        <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            No trucks yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by adding your first truck.
                        </p>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Truck
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
