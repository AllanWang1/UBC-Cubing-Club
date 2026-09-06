import Link from "next/link";
import "./adminDashboard.css";

export default function AdminPage() {
    return (
        <section className = "admin-dashboard"> 
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
            </header>

            <div className="admin-actions">
                <Link href="/admin/home-content" className="admin-action-card"> 
                    <h2>Homepage Information</h2>
                    <p>Edit the meeting location, meeting time, and social media links.</p>
                    <span>Edit homepage information</span>
                </Link>

                <Link href="/admin/executives" className="admin-action-card">
                    <h2>Executives</h2>
                    <p>Edit executive profiles, quotes, positions, and profile pictures.</p>
                    <span>Manage executives</span>
                </Link>
            </div>
        </section>
    );
}