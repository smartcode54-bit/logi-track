"use client";

import { useEffect, useState } from "react";
import { TransactionData, getTruckTransactions } from "../../transactions/actions.client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, Loader2, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionHistoryProps {
    truckId: string;
}

export function TransactionHistory({ truckId }: TransactionHistoryProps) {
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            const data = await getTruckTransactions(truckId);
            setTransactions(data);
            setLoading(false);
        }
        if (truckId) fetchHistory();
    }, [truckId]);

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
    }

    const totalCost = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div>
                    <CardTitle className="text-xl font-bold">Cost of Ownership</CardTitle>
                    <CardDescription>History of all financial transactions</CardDescription>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Spend</p>
                    <p className="text-2xl font-bold text-primary">฿{totalCost.toLocaleString()}</p>
                </div>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>No transaction history found.</p>
                        <p className="text-sm">Renewals and maintenance costs will appear here.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Amount (THB)</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        {tx.date}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            tx.type === "tax" ? "default" :
                                                tx.type === "insurance" ? "secondary" : "outline"
                                        } className="capitalize">
                                            {tx.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{tx.subType}</span>
                                            {tx.notes && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{tx.notes}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {tx.performedBy}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium">
                                        {tx.amount?.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {tx.receiptUrl && (
                                            <Button variant="ghost" size="icon" asChild title="View Receipt">
                                                <a href={tx.receiptUrl} target="_blank" rel="noopener noreferrer">
                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                </a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
