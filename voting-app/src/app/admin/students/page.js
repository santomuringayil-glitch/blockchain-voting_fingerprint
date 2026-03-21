"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminStudents() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");

    const fetchStudents = async () => {
        try {
            const [userData, studentsData] = await Promise.all([
                fetch("/api/auth/me").then((r) => r.json()),
                fetch("/api/admin/students").then((r) => r.json()),
            ]);

            if (!userData.user || userData.user.role !== "admin") {
                router.push("/login");
                return;
            }

            setUser(userData.user);
            setStudents(studentsData.students || []);
            setLoading(false);
        } catch {
            router.push("/login");
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    const handleDelete = async (studentId, studentName) => {
        if (!confirm(`Are you sure you want to remove ${studentName}? This action cannot be undone.`)) return;
        
        setActionLoading(studentId);
        try {
            const res = await fetch(`/api/admin/students/${studentId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete student");
            await fetchStudents();
        } catch (e) {
            alert(e.message);
        }
        setActionLoading("");
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: "100vh" }}>
                <div className="spinner"></div>
                <span>Loading students...</span>
            </div>
        );
    }

    return (
        <>
            <nav className="nav-bar">
                <Link href="/admin/dashboard" className="nav-logo">
                    <img src="/logo.png" alt="BlockVote Logo" className="nav-logo-img" />
                    <span>BlockVote Admin</span>
                </Link>
                <div className="nav-links">
                    <span className="nav-link">
                        {user?.username}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Registered Students</h1>
                        <p className="page-subtitle">
                            View and manage all registered voters
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <Link href="/admin/dashboard" className="btn btn-secondary">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

                {students.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3>No Students Found</h3>
                        <p className="text-muted">
                            There are currently no registered students in the system.
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Student ID</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Wallet</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id}>
                                        <td><strong>{student.fullName}</strong></td>
                                        <td>
                                            <code style={{ fontSize: "0.9rem", color: "var(--accent-primary)", background: "rgba(99,102,241,0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                                                {student.studentId}
                                            </code>
                                        </td>
                                        <td style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{student.email}</td>
                                        <td>{student.department}</td>
                                        <td>{student.year}</td>
                                        <td>
                                            {student.walletAddress ? (
                                                <code style={{ fontSize: "0.75rem", background: "rgba(99,102,241,0.1)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                                                    {student.walletAddress.slice(0, 8)}...
                                                </code>
                                            ) : (
                                                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Pending</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(student._id, student.fullName)}
                                                disabled={actionLoading === student._id}
                                            >
                                                {actionLoading === student._id ? (
                                                    <span className="spinner"></span>
                                                ) : (
                                                    "🗑️ Remove"
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
