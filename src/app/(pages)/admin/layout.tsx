import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/lib/requireAdmin";

export default async function AdminLayout ({children,}: {children: React.ReactNode;}) {
    const authorization = await requireAdmin();

    if(!authorization.authorized) {
        redirect("/");
    }

    return (
        <main className = "admin-layout">
            {children}
        </main>
    )
}