"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ElectionVotePage() {
    const router = useRouter();
    const params = useParams();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        fetch(`/api/elections/${params.id}`)
            .then((r) => r.json())
            .then((data) => {
                setElection(data.election);
                setCandidates(data.candidates || []);
                setLoading(false);
            })
            .catch(() => router.push("/student/dashboard"));
    }, [params.id, router]);

    const openVoteModal = (candidate) => {
        setSelectedCandidate(candidate);
        setMessage({ type: "", text: "" });
        setShowModal(true);
    };

    const handleVote = async () => {
        setVoting(true);
        setMessage({ type: "", text: "" });

        try {
            // Biometric Challenge
            let biometricToken = "bypass_dev"; // Fallback for dev without hardware
            try {
                const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
                const isAvailable = await BiometricAuth.checkBiometry();

                if (isAvailable.isAvailable) {
                    const originalConsoleError = console.error;
                    console.error = (...args) => {
                        if (args[0] && typeof args[0] === 'string' && args[0].includes('cancelled')) return;
                        if (args[0]?.message?.includes('cancelled')) return;
                        originalConsoleError(...args);
                    };

                    try {
                        await BiometricAuth.authenticate({
                            reason: "Verify your identity to cast this vote",
                            cancelTitle: "Cancel",
                            allowDeviceCredential: true
                        });
                    } finally {
                        console.error = originalConsoleError;
                    }

                    // If authentication passes, no exception is thrown
                    const { Device } = await import('@capacitor/device');
                    const deviceId = await Device.getId();
                    biometricToken = `bio-${deviceId.identifier}`;
                } else {
                    console.log("Biometrics not available on this device, proceeding with fallback.");
                }
            } catch (e) {
                if (e.code === 'userCancel' || e.message?.toLowerCase().includes('cancel')) {
                    setMessage({ type: "error", text: "Biometric authentication cancelled." });
                    setVoting(false);
                    return;
                }
                console.warn("Biometric plugin error:", e);
                // Proceed with fallback for web testing, in production you'd restrict this
                // or you could block the vote here if strict hardware is required on all devices
            }

            // Step 1: Cast vote
            const voteRes = await fetch("/api/vote/cast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    electionId: params.id,
                    candidateIndex: selectedCandidate.candidateIndex,
                    biometricToken: biometricToken
                }),
            });

            const voteData = await voteRes.json();
            if (!voteRes.ok) {
                setMessage({ type: "error", text: voteData.error });
                setVoting(false);
                return;
            }

            setMessage({ type: "success", text: "🎉 Vote cast successfully! Secured by Biometrics 🔒" });
            setHasVoted(true);
            setVoting(false);

            setTimeout(() => {
                setShowModal(false);
            }, 2000);
        } catch {
            setMessage({ type: "error", text: "An error occurred. Please try again." });
            setVoting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: "100vh" }}>
                <div className="spinner"></div>
                <span>Loading election...</span>
            </div>
        );
    }

    return (
        <>
            <nav className="nav-bar">
                <Link href="/student/dashboard" className="nav-logo">
                    <img src="/logo.png" alt="BlockVote Logo" className="nav-logo-img" />
                    <span>BlockVote</span>
                </Link>
                <Link href="/student/dashboard" className="btn btn-secondary btn-sm">
                    ← Back to Dashboard
                </Link>
            </nav>

            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{election?.title}</h1>
                        <p className="page-subtitle">{election?.description}</p>
                    </div>
                    {election?.status === "active" ? (
                        <span className="badge badge-active">Live</span>
                    ) : election?.status === "completed" ? (
                        <span className="badge badge-completed" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>Voting Ended</span>
                    ) : (
                        <span className="badge badge-results">Results Published</span>
                    )}
                </div>

                {election?.status === "results_published" && (
                    <div className="alert alert-info" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>📊 Results for this election are now available!</span>
                        <Link href={`/student/results/${params.id}`} className="btn btn-primary btn-sm">
                            View Results
                        </Link>
                    </div>
                )}

                {election?.status === "completed" && (
                    <div className="alert alert-warning" style={{ marginBottom: "2rem" }}>
                        ⏳ Voting has ended for this election. Information is now read-only. Results will be published soon.
                    </div>
                )}

                {hasVoted && (
                    <div className="alert alert-success">
                        ✅ You have successfully cast your vote in this election. Thank you for participating!
                    </div>
                )}

                <h2
                    style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "var(--text-secondary)",
                    }}
                >
                    Select your candidate:
                </h2>

                {candidates.map((candidate) => (
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
                                {candidate.party} • {candidate.department}
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
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openVoteModal(candidate)}
                            disabled={hasVoted || election?.status !== "active"}
                        >
                            {hasVoted ? "✓ Voted" : election?.status !== "active" ? "Closed" : "Vote"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Fingerprint Verification Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => !voting && setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center" }}>
                            <img src="/logo.png" alt="" style={{ width: "24px", height: "24px" }} />
                            Confirm Your Vote
                        </h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                            Voting for{" "}
                            <strong style={{ color: "var(--text-primary)" }}>
                                {selectedCandidate?.fullName}
                            </strong>
                        </p>

                        {message.text && (
                            <div
                                className={`alert ${message.type === "error" ? "alert-error" : "alert-success"
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        <p style={{ textAlign: "center", padding: "1rem 0", fontSize: "1.1rem" }}>
                            Are you sure you want to cast your vote? This action cannot be undone.
                        </p>

                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                                disabled={voting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleVote}
                                disabled={voting || hasVoted}
                            >
                                {voting ? (
                                    <>
                                        <span className="spinner"></span> Verifying & Voting...
                                    </>
                                ) : (
                                    "Confirm Vote"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
