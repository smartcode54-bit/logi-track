import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language";
import { ImagePlus, X } from "lucide-react";
import React from "react";

interface PhotosSectionProps {
    images: { file: File; preview: string }[];
    setImages: React.Dispatch<React.SetStateAction<{ file: File; preview: string }[]>>;
    existingImages?: string[];
    onRemoveExistingImage?: (index: number) => void;
}

export function PhotosSection({ images, setImages, existingImages = [], onRemoveExistingImage }: PhotosSectionProps) {
    const { t } = useLanguage();

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

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{t("Photos")}</h2>

            {/* Existing Images from Firebase */}
            {existingImages.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t("Existing Photos")}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((url, index) => (
                            <div key={`existing-${index}`} className="relative group">
                                <img
                                    src={url}
                                    alt={`Truck photo ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border border-border"
                                />
                                {onRemoveExistingImage && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveExistingImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* New Images Preview Grid */}
            {images.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t("New Photos")}</p>
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
    );
}

