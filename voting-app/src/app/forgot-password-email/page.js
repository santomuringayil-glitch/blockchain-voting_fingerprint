"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordEmailPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        
        if (!email.trim()) {
            setError("Please enter your registered email address.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to send reset email");
                setLoading(false);
                return;
            }

            setMessage("A secure password reset link has been sent to your email. It will expire in 15 minutes.");
            setLoading(false);

        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{ paddingTop: "4rem" }}>
            <div className="form-card" style={{ position: "relative" }}>
                <button 
                    onClick={() => router.back()} 
                    style={{
                        position: "absolute",
                        top: "1.5rem",
                        left: "1.5rem",
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.9rem",
                        padding: "0.5rem"
                    }}
                >
                    ⬅️ Back
                </button>
                <h1 className="form-title" style={{ marginTop: "1rem" }}>📧 Reset via Email</h1>
                <p className="form-subtitle">Enter your registered email to receive a secure reset link</p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}
                {message && <div className="alert alert-success" style={{ background: "rgba(34, 197, 94, 0.1)", color: "var(--success-color)", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid var(--success-color)", marginBottom: "1.5rem" }}>✓ {message}</div>}

                {!message && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@college.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-footer">
                            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner"></span> Sending Link...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
