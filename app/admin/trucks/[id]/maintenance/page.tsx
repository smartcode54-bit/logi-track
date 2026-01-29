import MaintenanceClient from "./MaintenanceClient";

// Required for static export with dynamic routes
export async function generateStaticParams() {
    return [{ id: "placeholder" }];
}

export default function MaintenancePage() {
    return <MaintenanceClient />;
}
