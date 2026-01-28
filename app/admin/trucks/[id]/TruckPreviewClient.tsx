import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Edit, Truck, Calendar, User, FileText, Info, Loader2, Camera,
    MapPin, Phone, Shield, MoreHorizontal, Download, Plus,
    Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { getTruckByIdClient, TruckData } from "../actions.client";
import { FileViewer } from "@/components/ui/file-viewer";
import { getSubcontractors } from "../../subcontractors/actions.client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBreadcrumb } from "@/context/breadcrumb";

export default function TruckPreviewClient() {
    const params = useParams();
    const router = useRouter();
    const truckId = params.id as string;
    const { setCustomLastItem } = useBreadcrumb();

    const [truck, setTruck] = useState<TruckData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [subcontractors, setSubcontractors] = useState<any[]>([]);

    useEffect(() => {
        const fetchTruck = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getTruckByIdClient(truckId);
                if (!data) {
                    setError("Truck not found.");
                    return;
                }
                setTruck(data);
                setCustomLastItem(`Truck ${data.licensePlate}`);
            } catch (err) {
                console.error("Error fetching truck:", err);
                setError(err instanceof Error ? err.message : "Failed to load truck data.");
            } finally {
                setIsLoading(false);
            }
        };

        if (truckId) {
            fetchTruck();
        }

        // Cleanup breadcrumb on unmount
        return () => {
            setCustomLastItem(null);
        };
    }, [truckId, setCustomLastItem]);

    // Fetch subcontractors to resolve names
    useEffect(() => {
        getSubcontractors().then(setSubcontractors);
    }, []);

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            active: "bg-green-100 text-green-800 hover:bg-green-100",
            inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100",
            maintenance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
            "insurance-claim": "bg-red-100 text-red-800 hover:bg-red-100",
            sold: "bg-purple-100 text-purple-800 hover:bg-purple-100",
        };

        const labels = {
            active: "Available",
            inactive: "Inactive",
            maintenance: "Maintenance",
            "insurance-claim": "Insurance Claim",
            sold: "Sold",
            // Fallback
            [status]: status
        };

        const statusKey = status as keyof typeof styles;
        return (
            <Badge className={styles[statusKey] || styles.inactive} variant="outline">
                {labels[statusKey as any] || status}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading truck data...</span>
            </div>
        );
    }

    if (error || !truck) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-destructive mb-4">
                        {error || "Truck not found"}
                    </h2>
                    <Button asChild>
                        <Link href="/admin/trucks">Back to Trucks</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Construct viewable files list
    const viewableFiles = [
        ...(truck.imageFrontRight ? [{ url: truck.imageFrontRight, type: "image" as const, label: "Front-Right View" }] : []),
        ...(truck.imageFrontLeft ? [{ url: truck.imageFrontLeft, type: "image" as const, label: "Front-Left View" }] : []),
        ...(truck.imageBackRight ? [{ url: truck.imageBackRight, type: "image" as const, label: "Back-Right View" }] : []),
        ...(truck.imageBackLeft ? [{ url: truck.imageBackLeft, type: "image" as const, label: "Back-Left View" }] : []),
        ...(truck.documentTax ? [{ url: truck.documentTax, type: "pdf" as const, label: "Tax Document" }] : []),
        ...(truck.documentRegister ? [{ url: truck.documentRegister, type: "pdf" as const, label: "Registration Document" }] : []),
        // Include generic images if any exist (legacy support)
        ...(truck.images || []).map((img, i) => ({ url: img, type: "image" as const, label: `Legacy Image ${i + 1}` })),
        // Include insurance docs
        ...(truck.insuranceDocuments || []).map((doc, i) => ({ url: doc, type: "pdf" as const, label: `Insurance Document ${i + 1}` })),
    ];

    const handleFileClick = (url: string) => {
        const index = viewableFiles.findIndex(f => f.url === url);
        if (index !== -1) {
            setViewerIndex(index);
            setIsViewerOpen(true);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-[1600px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight">{truck.licensePlate}</h1>
                        <StatusBadge status={truck.truckStatus} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Info className="h-3.5 w-3.5" />
                            Last updated: {truck.updatedAt ? new Date(truck.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "2 hours ago"}
                        </span>
                        <span>•</span>
                        <span>System ID: {truck.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Wrench className="h-4 w-4" />
                        Service Report
                    </Button>
                    <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Link href={`/admin/trucks/${truck.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Edit Details
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Vehicle Specifications */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Truck className="h-5 w-5 text-blue-600" />
                                Vehicle Specifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Brand</p>
                                <p className="font-semibold">{truck.brand}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Model</p>
                                <p className="font-semibold">{truck.model}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Year</p>
                                <p className="font-semibold">{truck.year}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fuel Type</p>
                                <p className="font-semibold">{truck.fuelType || "Diesel"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Max Load</p>
                                <p className="font-semibold">{truck.maxLoadWeight ? `${truck.maxLoadWeight.toLocaleString()} kg` : "-"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Engine & Registration */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Info className="h-5 w-5 text-blue-600" />
                                Engine & Registration
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Engine Number</span>
                                    <span className="text-sm font-medium font-mono">{truck.engineNumber}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Chassis Number</span>
                                    <span className="text-sm font-medium font-mono">{truck.vin}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Registration Date</span>
                                    <span className="text-sm font-medium">{formatDate(truck.registrationDate)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b items-center">
                                    <span className="text-sm text-muted-foreground">Insurance Expiry</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-red-600">{formatDate(truck.insuranceExpiryDate)}</span>
                                        {truck.insuranceExpiryDate && (
                                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px] h-5 px-1.5 rounded-sm">
                                                90 DAYS
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ownership Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Shield className="h-5 w-5 text-blue-600" />
                                Ownership Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted/30 rounded-lg p-4 border flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Truck className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        {truck.ownershipType === "subcontractor" ? "Subcontractor Fleet" : "Own Fleet"}
                                        {truck.ownershipType === "subcontractor" && (
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] h-5 px-1.5 rounded-sm">PARTNER</Badge>
                                        )}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {truck.ownershipType === "subcontractor" && truck.subcontractorId
                                            ? `Managed by ${subcontractors.find(s => s.id === truck.subcontractorId)?.name || truck.subcontractorId}`
                                            : "Managed by Internal Logistics Team"}
                                    </p>
                                    <Button variant="link" className="p-0 h-auto text-blue-600 mt-2 text-xs font-medium flex items-center gap-1">
                                        View Partner Profile <ArrowLeft className="h-3 w-3 rotate-180" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Current Assignment */}
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                Current Assignment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {/* Placeholder Logic for Assignment */}
                            {false ? (
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-3">
                                        <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                                            <AvatarImage src="/placeholder-avatar.jpg" />
                                            <AvatarFallback className="bg-muted text-muted-foreground">
                                                <User className="h-8 w-8" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background"></span>
                                    </div>
                                    <h3 className="text-lg font-bold">Johnathan Doe</h3>
                                    <p className="text-xs text-muted-foreground font-medium mb-4">Class A CDL • 8 Years Exp.</p>

                                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                                        <div className="bg-muted/50 rounded p-2 text-center">
                                            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5">License</p>
                                            <p className="text-xs font-semibold">#NY-882199</p>
                                        </div>
                                        <div className="bg-muted/50 rounded p-2 text-center">
                                            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5">Status</p>
                                            <p className="text-xs font-semibold">On Duty</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        <Button variant="outline" className="w-full text-xs h-9">
                                            <Phone className="h-3.5 w-3.5 mr-2" />
                                            Call
                                        </Button>
                                        <Button className="w-full text-xs h-9 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100 shadow-none">
                                            Profile
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                        <User className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium mb-1">No Driver Assigned</p>
                                    <p className="text-xs text-muted-foreground mb-4">Assign a driver to this truck to track performance.</p>
                                    <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                        <Plus className="h-4 w-4" />
                                        Assign Driver
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Vehicle Photos */}
                    <Card>
                        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Camera className="h-5 w-5 text-blue-600" />
                                Vehicle Photos
                            </CardTitle>
                            <span className="text-xs font-medium text-muted-foreground">{viewableFiles.filter(f => f.type === 'image').length} PHOTOS</span>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-2">
                                {viewableFiles.filter(f => f.type === 'image').map((file, i) => (
                                    <div
                                        key={i}
                                        className="relative aspect-video rounded-md overflow-hidden bg-muted border cursor-pointer"
                                        onClick={() => handleFileClick(file.url)}
                                    >
                                        <Image src={file.url} alt={file.label} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <FileViewer
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                files={viewableFiles}
                initialIndex={viewerIndex}
            />
        </div>
    );
}
