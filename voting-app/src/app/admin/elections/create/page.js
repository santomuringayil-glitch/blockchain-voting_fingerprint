"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateElectionPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        electionCode: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.title || !formData.startDate || !formData.endDate) {
            setError("Title, start date, and end date are required");
            return;
        }

        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            setError("End date must be after start date");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/elections/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to create election");
                setLoading(false);
                return;
            }

            // Redirect to add candidates
            router.push(`/admin/elections/${data.election._id}/candidates`);
        } catch {
            setError("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    const update = (field) => (e) =>
        setFormData({ ...formData, [field]: e.target.value });

    return (
        <>
            <nav className="nav-bar">
                <Link href="/admin/dashboard" className="nav-logo" style={{ textDecoration: "none" }}>
                    🛡️ BlockVote Admin
                </Link>
                <Link href="/admin/dashboard" className="btn btn-secondary btn-sm">
                    ← Back to Dashboard
                </Link>
            </nav>

            <div className="form-container" style={{ paddingTop: "2rem" }}>
                <div className="form-card">
                    <h1 className="form-title">Create Election</h1>
                    <p className="form-subtitle">
                        Set up a new election and deploy its smart contract
                    </p>

                    {error && <div className="alert alert-error">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Election Title</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Student Council Election 2026"
                                value={formData.title}
                                onChange={update("title")}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Describe the purpose of this election..."
                                value={formData.description}
                                onChange={update("description")}
                                rows={3}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.startDate}
                                    onChange={update("startDate")}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.endDate}
                                    onChange={update("endDate")}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Custom Election ID (Optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Leave blank to auto-generate (e.g., ELECTION-20231001-0001)"
                                value={formData.electionCode}
                                onChange={update("electionCode")}
                            />
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                Only fill this out if you need to override the auto-generated ID.
                            </p>
                        </div>

                        <div className="form-footer">
                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span> Creating Election...
                                    </>
                                ) : (
                                    "Create Election"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
