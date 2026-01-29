import RenewalClient from "./RenewalClient";

// Required for static export with dynamic routes
export async function generateStaticParams() {
    return [{ id: "placeholder" }];
}

export default function RenewalPage() {
    return <RenewalClient />;
}
