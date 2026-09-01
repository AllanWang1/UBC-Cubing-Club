import Link from "next/link";
import "./adminDashboard.css";

export default function AdminPage() {
    return (
        <section className = "admin-dashboard"> 
            <h1>Admin Dashboard</h1>

            <p>Manage website content.</p>

            <div className="admin-actions">
                <Link href="/admin/home-content"> 
                    Edit Homepage Information
                </Link>

                <Link href="/admin/executives">
                    Manage Executives
                </Link>
            </div>
        </section>
    )
}