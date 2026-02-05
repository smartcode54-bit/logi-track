import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'shopee data', 'SPX_Hub.xlsx');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Hub data file not found' }, { status: 404 });
        }

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        // Map data to a cleaner format if possible, otherwise return generic list
        // Assuming headers like "Hub Code", "Hub Name" based on common formats
        // We'll return the raw list and let the client filter

        return NextResponse.json({ hubs: data });
    } catch (error) {
        console.error('Error reading hub data:', error);
        return NextResponse.json({ error: 'Failed to read hub data' }, { status: 500 });
    }
}
