import EditTruckWrapper from "./EditTruckWrapper";

// Required for static export with dynamic routes
// Return a placeholder path - actual content is loaded client-side

export async function generateStaticParams() {
    // Return at least one dummy param to satisfy static export requirements
    // The actual route handling is done client-side
    return [{ id: "placeholder" }];
}

export default function EditTruckPage() {
    return <EditTruckWrapper />;
}
