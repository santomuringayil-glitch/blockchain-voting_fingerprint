"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ManageCandidatesPage() {
    const router = useRouter();
    const params = useParams();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        party: "",
        department: "",
        manifesto: "",
        imageUrl: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchData = async () => {
        try {
            const [electionRes, candidatesRes] = await Promise.all([
                fetch(`/api/elections/${params.id}`).then((r) => r.json()),
                fetch(`/api/elections/${params.id}/candidates`).then((r) => r.json()),
            ]);
            setElection(electionRes.election);
            setCandidates(candidatesRes.candidates || []);
            setLoading(false);
        } catch {
            router.push("/admin/dashboard");
        }
    };

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 150;
                const MAX_HEIGHT = 150;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.fullName) {
            setError("Candidate name is required");
            return;
        }

        setAdding(true);

        try {
            const res = await fetch(`/api/elections/${params.id}/candidates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to add candidate");
                setAdding(false);
                return;
            }

            setSuccess(`${formData.fullName} added successfully!`);
            setFormData({ fullName: "", party: "", department: "", manifesto: "", imageUrl: "" });
            // Reset the file input visually
            const fileInput = document.getElementById("candidateImage");
            if (fileInput) fileInput.value = "";
            await fetchData();
            setAdding(false);
        } catch {
            setError("An error occurred. Please try again.");
            setAdding(false);
        }
    };

    const update = (field) => (e) =>
        setFormData({ ...formData, [field]: e.target.value });

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: "100vh" }}>
                <div className="spinner"></div>
                <span>Loading...</span>
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
                <Link href="/admin/dashboard" className="btn btn-secondary btn-sm">
                    ← Back to Dashboard
                </Link>
            </nav>

            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            Manage Candidates
                        </h1>
                        <p className="page-subtitle">{election?.title}</p>
                    </div>
                    <span className="badge badge-upcoming">
                        {candidates.length} Candidates
                    </span>
                </div>

                {/* Add Candidate Form */}
                <div className="card" style={{ marginBottom: "2rem" }}>
                    <h3 className="card-title">➕ Add New Candidate</h3>

                    {error && <div className="alert alert-error mt-2">⚠️ {error}</div>}
                    {success && (
                        <div className="alert alert-success mt-2">✅ {success}</div>
                    )}

                    <form onSubmit={handleAddCandidate} style={{ marginTop: "1rem" }}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Candidate name"
                                    value={formData.fullName}
                                    onChange={update("fullName")}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Party / Group</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Student Progress Alliance"
                                    value={formData.party}
                                    onChange={update("party")}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Profile Image (Optional)</label>
                                <input
                                    type="file"
                                    id="candidateImage"
                                    className="form-input"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ padding: "0.5rem" }}
                                />
                                {formData.imageUrl && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <img src={formData.imageUrl} alt="Preview" style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Computer Science"
                                    value={formData.department}
                                    onChange={update("department")}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Manifesto</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Brief manifesto or campaign promise (max 500 chars)"
                                    value={formData.manifesto}
                                    onChange={update("manifesto")}
                                    maxLength={500}
                                    rows={2}
                                />
                            </div>
                            <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    disabled={adding}
                                >
                                    {adding ? (
                                        <>
                                            <span className="spinner"></span> Adding...
                                        </>
                                    ) : (
                                        "Add Candidate"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Candidates List */}
                <h3
                    style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "var(--text-secondary)",
                    }}
                >
                    Registered Candidates
                </h3>

                {candidates.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3>No Candidates Yet</h3>
                        <p className="text-muted">
                            Add candidates using the form above.
                        </p>
                    </div>
                ) : (
                    candidates.map((candidate) => (
                        <div key={candidate._id} className="candidate-card">
                            <div className="candidate-avatar" style={{ overflow: "hidden", padding: candidate.imageUrl ? 0 : undefined }}>
                                {candidate.imageUrl ? (
                                    <img src={candidate.imageUrl} alt={candidate.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    candidate.fullName.charAt(0)
                                )}
                            </div>
                            <div className="candidate-info">
                                <div className="candidate-name">{candidate.fullName}</div>
                                <div className="candidate-meta">
                                    {candidate.party || "Independent"} •{" "}
                                    {candidate.department || "N/A"} • Index #
                                    {candidate.candidateIndex}
                                </div>
                                {candidate.manifesto && (
                                    <p
                                        style={{
                                            fontSize: "0.85rem",
                                            color: "var(--text-muted)",
                                            marginTop: "0.3rem",
                                        }}
                                    >
                                        {candidate.manifesto}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
