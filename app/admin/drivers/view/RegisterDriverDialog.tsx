"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { driverSchema, Driver } from "@/validate/driverSchema";
import { addDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/client";
import { COLLECTIONS } from "@/lib/collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, ChevronRight, ChevronLeft, Check, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadDriverFile } from "../actions.client";
import Image from "next/image";

const STEPS = [
    { id: 'personal', title: 'Personal Info', fields: ['firstName', 'lastName', 'mobile', 'email', 'birthDate'] },
    { id: 'identity', title: 'Identity & License', fields: ['idCard', 'truckLicenseId'] },
    { id: 'employment', title: 'Employment', fields: ['employmentType', 'employmentPeriod.start', 'employmentPeriod.end'] },
];

export function RegisterDriverDialog() {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [truckLicenseFile, setTruckLicenseFile] = useState<File | null>(null);

    const [subcontractors, setSubcontractors] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        trigger,
        setValue,
        formState: { errors },
    } = useForm<Driver>({
        resolver: zodResolver(driverSchema),
        defaultValues: {
            status: "Active",
            employmentType: "FULL_TIME",
        }
    });

    const employmentType = watch("employmentType");

    // Fetch Subcontractors
    useEffect(() => {
        const fetchSubcontractors = async () => {
            if (employmentType === 'SUBCONTRACTOR') {
                try {
                    const q = query(collection(db, COLLECTIONS.SUBCONTRACTORS)); // Fetch all or filter active? Assuming all for now
                    const snapshot = await getDocs(q);
                    const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setSubcontractors(subs);
                } catch (err) {
                    console.error("Error fetching subcontractors:", err);
                    toast.error("Failed to load subcontractors");
                }
            }
        };
        fetchSubcontractors();
    }, [employmentType]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setValue("profileImage", undefined);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
        }
    };

    const onSubmit = async (data: Driver) => {
        setIsSubmitting(true);
        try {
            let profileImageUrl = data.profileImage;
            let idCardImageUrl = data.idCardImage;
            let truckLicenseImageUrl = data.truckLicenseImage;

            // Upload Profile Image
            if (selectedImage) {
                const path = `drivers/profile/${Date.now()}_${selectedImage.name}`;
                profileImageUrl = await uploadDriverFile(selectedImage, path);
            }

            // Upload ID Card Image
            if (idCardFile) {
                const path = `drivers/documents/${Date.now()}_id_card_${idCardFile.name}`;
                idCardImageUrl = await uploadDriverFile(idCardFile, path);
            }

            // Upload Truck License Image
            if (truckLicenseFile) {
                const path = `drivers/documents/${Date.now()}_license_${truckLicenseFile.name}`;
                truckLicenseImageUrl = await uploadDriverFile(truckLicenseFile, path);
            }

            // @ts-ignore
            await addDoc(collection(db, COLLECTIONS.DRIVERS), {
                ...data,
                profileImage: profileImageUrl,
                idCardImage: idCardImageUrl,
                truckLicenseImage: truckLicenseImageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            toast.success(`Driver ${data.firstName} ${data.lastName} registered successfully.`);

            setOpen(false);
            reset();
            setCurrentStep(0);

            // Reset files
            setSelectedImage(null);
            setImagePreview(null);
            setIdCardFile(null);
            setTruckLicenseFile(null);

        } catch (error) {
            console.error("Error registering driver:", error);
            toast.error("Failed to register driver. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        const fields = STEPS[currentStep].fields as any[];
        const isValid = await trigger(fields);
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                reset();
                setCurrentStep(0);
                setSelectedImage(null);
                setImagePreview(null);
                setIdCardFile(null);
                setTruckLicenseFile(null);
            }
        }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Register New Driver
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Register New Driver</DialogTitle>
                    <DialogDescription>
                        Step {currentStep + 1} of {STEPS.length} - {STEPS[currentStep].title}
                    </DialogDescription>
                </DialogHeader>

                {/* Stepper Indicator */}
                <div className="flex items-center justify-center mb-6">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-colors",
                                index <= currentStep
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "bg-background border-muted-foreground text-muted-foreground"
                            )}>
                                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={cn(
                                    "w-12 h-0.5 mx-2 transition-colors",
                                    index < currentStep ? "bg-blue-600" : "bg-muted"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Personal Info Step */}
                    {currentStep === 0 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative group">
                                        {imagePreview ? (
                                            <Image
                                                src={imagePreview}
                                                alt="Profile Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <label htmlFor="profile-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                                <Upload className="h-6 w-6 text-muted-foreground mb-1 group-hover:text-blue-500" />
                                                <span className="text-[10px] text-muted-foreground group-hover:text-blue-500">Upload Photo</span>
                                            </label>
                                        )}
                                        <Input
                                            id="profile-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                                    <Input id="firstName" placeholder="First Name" {...register("firstName")} />
                                    {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                                    <Input id="lastName" placeholder="Last Name" {...register("lastName")} />
                                    {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                                <Input id="mobile" placeholder="08x-xxx-xxxx" {...register("mobile")} />
                                {errors.mobile && <span className="text-xs text-red-500">{errors.mobile.message}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="email@example.com" {...register("email")} />
                                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="birthDate">Birth Date (Age 20-55) <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="birthDate"
                                    render={({ field }) => {
                                        const maxDate = new Date();
                                        maxDate.setFullYear(maxDate.getFullYear() - 20);
                                        const minDate = new Date();
                                        minDate.setFullYear(minDate.getFullYear() - 55);

                                        return (
                                            <DriverDatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                fromYear={minDate.getFullYear()}
                                                toYear={maxDate.getFullYear()}
                                                disabled={(date) =>
                                                    date > maxDate || date < minDate || date > new Date("2100-01-01")
                                                }
                                                error={errors.birthDate?.message}
                                            />
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Identity Step */}
                    {currentStep === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                            {/* ID Card Section */}
                            <div className="border p-4 rounded-md space-y-4">
                                <h3 className="font-semibold text-sm">National ID Card</h3>
                                <div className="grid gap-2">
                                    <Label htmlFor="idCard">ID Card Number <span className="text-red-500">*</span></Label>
                                    <Input id="idCard" placeholder="13-digit ID" {...register("idCard")} />
                                    {errors.idCard && <span className="text-xs text-red-500">{errors.idCard.message}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="idCardExpiredDate">ID Card Expiry Date</Label>
                                    <Controller
                                        control={control}
                                        name="idCardExpiredDate"
                                        render={({ field }) => (
                                            <DriverDatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                fromYear={new Date().getFullYear() - 10}
                                                toYear={new Date().getFullYear() + 20}
                                                disabled={(date) => date < new Date("1900-01-01")}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="idCardFile">Upload ID Card Image</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="idCardFile"
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleFileChange(e, setIdCardFile)}
                                            className="cursor-pointer"
                                        />
                                        {idCardFile && <FileText className="text-green-600 h-5 w-5" />}
                                    </div>
                                </div>
                            </div>

                            {/* License Section */}
                            <div className="border p-4 rounded-md space-y-4">
                                <h3 className="font-semibold text-sm">Driving License</h3>
                                <div className="grid gap-2">
                                    <Label htmlFor="truckLicenseId">Truck License ID <span className="text-red-500">*</span></Label>
                                    <Input id="truckLicenseId" placeholder="License No." {...register("truckLicenseId")} />
                                    {errors.truckLicenseId && <span className="text-xs text-red-500">{errors.truckLicenseId.message}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="truckLicenseExpiredDate">License Expiry Date</Label>
                                    <Controller
                                        control={control}
                                        name="truckLicenseExpiredDate"
                                        render={({ field }) => (
                                            <DriverDatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                fromYear={new Date().getFullYear() - 10}
                                                toYear={new Date().getFullYear() + 20}
                                                disabled={(date) => date < new Date("1900-01-01")}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="truckLicenseFile">Upload License Image</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="truckLicenseFile"
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleFileChange(e, setTruckLicenseFile)}
                                            className="cursor-pointer"
                                        />
                                        {truckLicenseFile && <FileText className="text-green-600 h-5 w-5" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Employment Step */}
                    {currentStep === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="grid gap-2">
                                <Label>Employment Type</Label>
                                <Controller
                                    control={control}
                                    name="employmentType"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                                <SelectItem value="PART_TIME">Part Time</SelectItem>
                                                <SelectItem value="SUBCONTRACTOR">Subcontractor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {employmentType === 'SUBCONTRACTOR' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="subcontractorId">Subcontractor</Label>
                                    <Controller
                                        control={control}
                                        name="subcontractorId"
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    const selectedSub = subcontractors.find(s => s.id === val);
                                                    if (selectedSub) {
                                                        setValue("subcontractorName", selectedSub.companyName || selectedSub.name || "Unknown");
                                                    }
                                                }}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Subcontractor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subcontractors.map((sub) => (
                                                        <SelectItem key={sub.id} value={sub.id}>
                                                            {sub.companyName || sub.name || "Unnamed Subcontractor"}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            )}

                            {employmentType !== 'PART_TIME' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="contractYears">Contract Years</Label>
                                    <Input
                                        id="contractYears"
                                        type="number"
                                        placeholder="e.g. 1"
                                        {...register("contractYears")}
                                    />
                                </div>
                            )}

                            {employmentType === 'PART_TIME' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Start Date</Label>
                                        <Controller
                                            control={control}
                                            name="employmentPeriod.start"
                                            render={({ field }) => (
                                                <DriverDatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    fromYear={new Date().getFullYear() - 5}
                                                    toYear={new Date().getFullYear() + 5}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>End Date</Label>
                                        <Controller
                                            control={control}
                                            name="employmentPeriod.end"
                                            render={({ field }) => (
                                                <DriverDatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    fromYear={new Date().getFullYear() - 5}
                                                    toYear={new Date().getFullYear() + 5}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Controller
                                    control={control}
                                    name="status"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="On-Duty">On-Duty</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex justify-between sm:justify-between w-full pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 0 || isSubmitting}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        {currentStep < STEPS.length - 1 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                            >
                                Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        Finish & Register <Check className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DriverDatePicker({
    value,
    onChange,
    error,
    fromYear,
    toYear,
    disabled
}: {
    value?: Date;
    onChange: (date?: Date) => void;
    error?: string;
    fromYear?: number;
    toYear?: number;
    disabled?: (date: Date) => boolean;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="grid gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        {value ? format(value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={(date) => {
                            onChange(date);
                            setOpen(false);
                        }}
                        captionLayout="dropdown"
                        fromYear={fromYear}
                        toYear={toYear}
                        defaultMonth={value || new Date()}
                        disabled={disabled}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
