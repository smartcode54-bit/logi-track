"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, Plus, Search, MapPin, Truck } from "lucide-react";
import { FirstMileImportDialog } from "./import-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SOC_DESTINATIONS, SOC_KEYS, FirstMileTask } from "@/validate/firstMileTaskSchema";

// Mock Data for initial display (since we don't have backend data yet)
const MOCK_TASKS: Partial<FirstMileTask>[] = [
    {
        id: "1",
        date: new Date(),
        sourceHub: "FBPLI-G", // Example from image
        destination: "SOC-E",
        time: "15:00",
        plateType: "4WH",
        shipmentId: "159965",
        licensePlate: "3wn-1199",
        driverName: "Saharhat",
        driverPhone: "0902347255",
        status: "Assigned"
    },
    {
        id: "2",
        date: new Date(),
        sourceHub: "FBPLI-G",
        destination: "SOC-E",
        time: "16:00",
        plateType: "4WH",
        shipmentId: "166131",
        licensePlate: "uu-2480",
        driverName: "Chaloem",
        driverPhone: "0925811678",
        status: "Assigned"
    }
];

export default function FirstMilePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [tasks, setTasks] = useState<Partial<FirstMileTask>[]>(MOCK_TASKS);
    const [hubs, setHubs] = useState<any[]>([]);
    const [selectedHub, setSelectedHub] = useState<string>("all");
    const [selectedSOC, setSelectedSOC] = useState<string>("all");

    // Fetch Hubs
    useEffect(() => {
        const fetchHubs = async () => {
            try {
                const res = await fetch('/api/hubs');
                if (res.ok) {
                    const data = await res.json();
                    setHubs(data.hubs || []);
                }
            } catch (err) {
                console.error("Failed to fetch hubs", err);
            }
        };
        fetchHubs();
    }, []);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Date Filter (Simple string match for now)
            if (date && task.date && format(task.date, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')) {
                // return false; 
                // Commenting out strict date filter for mock data visibility
            }
            if (selectedSOC !== "all" && task.destination !== selectedSOC) return false;
            // Add Hub filter matches
            return true;
        });
    }, [tasks, date, selectedSOC]);

    const getSOCColor = (soc: string) => {
        switch (soc) {
            case "SOC-E": return "bg-emerald-600 hover:bg-emerald-700 text-white";
            case "SOC-N": return "bg-blue-600 hover:bg-blue-700 text-white";
            case "SOC-W": return "bg-orange-600 hover:bg-orange-700 text-white";
            default: return "bg-slate-600 text-white";
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-[1600px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">First Mile Tasks</h1>
                    <p className="text-muted-foreground mt-1">
                        Assign drivers to pick up from Hubs and deliver to SOCs (First Step of Day Trip).
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex gap-3">
                        <FirstMileImportDialog onSuccess={() => window.location.reload()} />
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Assignment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <label className="text-sm font-medium">Destination (SOC)</label>
                        <Select value={selectedSOC} onValueChange={setSelectedSOC}>
                            <SelectTrigger>
                                <SelectValue placeholder="All SOCs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All SOCs</SelectItem>
                                {SOC_KEYS.map(key => (
                                    <SelectItem key={key} value={key}>{SOC_DESTINATIONS[key]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px] flex-1">
                        <label className="text-sm font-medium">Source Hub</label>
                        <Select value={selectedHub} onValueChange={setSelectedHub}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Hub..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Hubs</SelectItem>
                                {/* Limit mapped hubs for performance if list is huge */}
                                {hubs.slice(0, 50).map((hub, idx) => (
                                    <SelectItem key={idx} value={hub['Hub Code'] || hub['Code'] || `hub-${idx}`}>
                                        {hub['Hub Name'] || hub['station_name_en'] || hub['Hub Code']}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <div className="border rounded-md bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Source Hub</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Shipment ID</TableHead>
                            <TableHead>License Plate</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.map((task) => (
                            <TableRow key={task.id} className="hover:bg-muted/50">
                                <TableCell>{task.date ? format(task.date, 'dd-MMM-yyyy') : '-'}</TableCell>
                                <TableCell className="font-medium">{task.sourceHub}</TableCell>
                                <TableCell>
                                    <Badge className={cn("font-normal border-0", getSOCColor(task.destination || ""))}>
                                        {task.destination ? SOC_DESTINATIONS[task.destination as keyof typeof SOC_DESTINATIONS] : task.destination}
                                    </Badge>
                                </TableCell>
                                <TableCell>{task.time}</TableCell>
                                <TableCell>
                                    <span className={cn(
                                        "px-2 py-1 rounded text-xs font-bold",
                                        task.plateType === "4WH" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                            task.plateType === "6WH" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                                                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                    )}>
                                        {task.plateType}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-sm">{task.shipmentId}</TableCell>
                                <TableCell className="font-mono">{task.licensePlate}</TableCell>
                                <TableCell>{task.driverName}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{task.driverPhone}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
