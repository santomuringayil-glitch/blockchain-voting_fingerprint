"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [elections, setElections] = useState([]);
    const [studentCount, setStudentCount] = useState(0);
    const [votedCount, setVotedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");

    const fetchData = async () => {
        try {
            const [userData, electionsData, statsData] = await Promise.all([
                fetch("/api/auth/me").then((r) => r.json()),
                fetch("/api/elections").then((r) => r.json()),
                fetch("/api/admin/stats").then((r) => r.json()),
            ]);

            if (!userData.user || userData.user.role !== "admin") {
                router.push("/login");
                return;
            }

            setUser(userData.user);
            setElections(electionsData.elections || []);
            setStudentCount(statsData.studentCount || 0);
            setVotedCount(statsData.votedCount || 0);
            setLoading(false);
        } catch {
            router.push("/login");
        }
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    const handleStatusChange = async (electionId, action) => {
        setActionLoading(electionId + action);
        try {
            await fetch(`/api/elections/${electionId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            await fetchData();
        } catch (e) {
            alert("Failed to update election status: " + e.message);
        }
        setActionLoading("");
    };

    const handleDelete = async (electionId) => {
        if (!confirm("Are you sure you want to delete this election? This action cannot be undone.")) return;
        setActionLoading(electionId + "delete");
        try {
            const res = await fetch(`/api/elections/${electionId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete election");
            await fetchData();
        } catch (e) {
            alert(e.message);
        }
        setActionLoading("");
    };

    const handlePublish = async (electionId) => {
        setActionLoading(electionId + "publish");
        try {
            await fetch(`/api/elections/${electionId}/publish`, {
                method: "POST",
            });
            await fetchData();
        } catch (e) {
            alert("Failed to publish results: " + e.message);
        }
        setActionLoading("");
    };

    const getStatusBadge = (status) => {
        const map = {
            upcoming: "badge-upcoming",
            active: "badge-active",
            completed: "badge-completed",
            results_published: "badge-results",
        };
        const labels = {
            upcoming: "Upcoming",
            active: "Live",
            completed: "Completed",
            results_published: "Published",
        };
        return (
            <span className={`badge ${map[status] || ""}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: "100vh" }}>
                <div className="spinner"></div>
                <span>Loading admin dashboard...</span>
            </div>
        );
    }

    return (
        <>
            <nav className="nav-bar">
                <span className="nav-logo">🛡️ BlockVote Admin</span>
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
                        <h1 className="page-title">Admin Dashboard</h1>
                        <p className="page-subtitle">
                            Manage elections, candidates, and results
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <div className="stat-card" style={{ 
                            background: "rgba(99,102,241,0.1)", 
                            padding: "0.5rem 1rem", 
                            borderRadius: "8px",
                            border: "1px solid rgba(99,102,241,0.2)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            minWidth: "120px"
                        }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Total Students</span>
                            <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent-primary)" }}>{studentCount}</span>
                        </div>

                        <Link href="/admin/students" className="btn btn-secondary" style={{ alignSelf: "center" }}>
                            👥 Manage Students
                        </Link>
                        <Link href="/admin/elections/create" className="btn btn-primary" style={{ alignSelf: "center" }}>
                            ➕ Create Election
                        </Link>
                    </div>
                </div>

                {elections.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No Elections Created</h3>
                        <p className="text-muted">
                            Get started by creating your first election.
                        </p>
                        <Link
                            href="/admin/elections/create"
                            className="btn btn-primary mt-2"
                        >
                            ➕ Create Election
                        </Link>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Election</th>
                                    <th>Status</th>
                                    <th>Votes</th>
                                    <th>Election ID</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Contract</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {elections.map((election) => (
                                    <tr key={election._id}>
                                        <td>
                                            <strong>{election.title}</strong>
                                            <div
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                {election.description?.slice(0, 50) || "—"}
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(election.status)}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <span style={{ fontWeight: "bold", color: "var(--accent-primary)" }}>
                                                {election.totalVotes || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <code
                                                style={{
                                                    fontSize: "0.9rem",
                                                    fontWeight: "bold",
                                                    color: "var(--accent-primary)",
                                                    background: "rgba(99,102,241,0.1)",
                                                    padding: "0.3rem 0.6rem",
                                                    borderRadius: "4px",
                                                    letterSpacing: "1px"
                                                }}
                                            >
                                                {election.electionCode || "N/A"}
                                            </code>
                                        </td>
                                        <td style={{ fontSize: "0.85rem" }}>
                                            {new Date(election.startDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ fontSize: "0.85rem" }}>
                                            {new Date(election.endDate).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <code
                                                style={{
                                                    fontSize: "0.7rem",
                                                    color: "var(--accent-primary)",
                                                    background: "rgba(99,102,241,0.1)",
                                                    padding: "0.2rem 0.4rem",
                                                    borderRadius: "4px",
                                                }}
                                            >
                                                {election.contractAddress
                                                    ? election.contractAddress.slice(0, 10) + "..."
                                                    : "N/A"}
                                            </code>
                                        </td>
                                        <td>
                                            <div className="btn-group">
                                                {election.status === "upcoming" && (
                                                    <>
                                                        <Link
                                                            href={`/admin/elections/${election._id}/candidates`}
                                                            className="btn btn-secondary btn-sm"
                                                        >
                                                            👥 Candidates
                                                        </Link>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() =>
                                                                handleStatusChange(election._id, "start")
                                                            }
                                                            disabled={
                                                                actionLoading === election._id + "start"
                                                            }
                                                        >
                                                            {actionLoading === election._id + "start" ? (
                                                                <span className="spinner"></span>
                                                            ) : (
                                                                "▶ Start"
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                                {election.status === "active" && (
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            handleStatusChange(election._id, "end")
                                                        }
                                                        disabled={actionLoading === election._id + "end"}
                                                    >
                                                        {actionLoading === election._id + "end" ? (
                                                            <span className="spinner"></span>
                                                        ) : (
                                                            "⏹ End"
                                                        )}
                                                    </button>
                                                )}
                                                {election.status === "completed" && (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handlePublish(election._id)}
                                                        disabled={
                                                            actionLoading === election._id + "publish"
                                                        }
                                                    >
                                                        {actionLoading === election._id + "publish" ? (
                                                            <span className="spinner"></span>
                                                        ) : (
                                                            "📊 Publish Results"
                                                        )}
                                                    </button>
                                                )}
                                                {election.status === "results_published" && (
                                                    <span
                                                        style={{
                                                            fontSize: "0.8rem",
                                                            color: "var(--success)",
                                                        }}
                                                    >
                                                        ✅ Published
                                                    </span>
                                                )}
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    style={{ marginLeft: "0.5rem", background: "var(--danger)" }}
                                                    onClick={() => handleDelete(election._id)}
                                                    disabled={actionLoading === election._id + "delete"}
                                                >
                                                    {actionLoading === election._id + "delete" ? (
                                                        <span className="spinner"></span>
                                                    ) : (
                                                        "🗑️ Delete"
                                                    )}
                                                </button>
                                            </div>
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
