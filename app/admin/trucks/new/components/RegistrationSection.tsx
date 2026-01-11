import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/context/language";

export function RegistrationSection() {
    const { control } = useFormContext();
    const { t } = useLanguage();

    return (
        <>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b pb-2">{t("Registration")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={control}
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
                        control={control}
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
                        control={control}
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

            <FormField
                control={control}
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
        </>
    );
}
