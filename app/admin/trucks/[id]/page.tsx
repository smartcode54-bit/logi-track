import TruckPreviewWrapper from "./TruckPreviewWrapper";

export async function generateStaticParams() {
    // Return at least one dummy param to satisfy static export requirements
    // The actual route handling is done client-side
    return [{ id: "placeholder" }];
}

export default function TruckPreviewPage() {
    return <TruckPreviewWrapper />;
}
