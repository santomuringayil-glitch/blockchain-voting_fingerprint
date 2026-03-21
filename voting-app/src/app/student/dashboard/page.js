"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);

    const [electionCode, setElectionCode] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/auth/me")
            .then((r) => r.json())
            .then((userData) => {
                if (!userData.user || userData.user.role !== "student") {
                    router.push("/login");
                    return;
                }
                setUser(userData.user);
                setLoading(false);
            })
            .catch(() => router.push("/login"));
    }, [router]);

    const handleJoinElection = async (e) => {
        e.preventDefault();
        setError("");
        setJoinLoading(true);

        try {
            const res = await fetch("/api/elections/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ electionCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to join election");
                setJoinLoading(false);
                return;
            }

            // Redirect based on status
            if (data.status === "results_published") {
                router.push(`/student/results/${data.electionId}`);
            } else {
                router.push(`/student/election/${data.electionId}`);
            }
        } catch {
            setError("An error occurred. Please try again.");
            setJoinLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: "100vh" }}>
                <div className="spinner"></div>
                <span>Loading dashboard...</span>
            </div>
        );
    }

    return (
        <>
            <nav className="nav-bar">
                <Link href="/student/dashboard" className="nav-logo">
                    <img src="/logo.png" alt="BlockVote Logo" className="nav-logo-img" />
                    <span>BlockVote Student</span>
                </Link>
                <div className="nav-links">
                    <span className="nav-link">
                        Welcome, {user?.studentId}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="page-container" style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "4rem" }}>
                <div className="page-header" style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <div>
                        <h1 className="page-title">Join an Election</h1>
                        <p className="page-subtitle">Enter the Election ID provided by your organization</p>
                    </div>
                </div>

                <div className="form-card" style={{ padding: "2.5rem" }}>
                    {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

                    <form onSubmit={handleJoinElection}>
                        <div className="form-group mb-4">
                            <label className="form-label" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
                                🔑 Election ID
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. ELECTION-20231001-0001"
                                value={electionCode}
                                onChange={(e) => setElectionCode(e.target.value.toUpperCase())}
                                style={{
                                    fontSize: "1rem",
                                    textAlign: "center",
                                    letterSpacing: "1px",
                                    fontWeight: "bold",
                                    padding: "1rem"
                                }}
                                required
                            />
                            <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
                                Enter the full Election ID (e.g., ELECTION-YYYYMMDD-XXXX).
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={joinLoading || electionCode.length < 3}
                        >
                            {joinLoading ? (
                                <>
                                    <span className="spinner"></span> Joining...
                                </>
                            ) : (
                                "Join Election"
                            )}
                        </button>
                    </form>
                </div>

                <div style={{ marginTop: "3rem", textAlign: "center" }}>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        Having trouble? contact your election administrator.
                    </p>
                </div>
            </div>
        </>
    );
}
