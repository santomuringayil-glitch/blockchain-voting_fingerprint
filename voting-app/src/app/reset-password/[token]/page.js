"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordTokenPage() {
    const router = useRouter();
    const params = useParams();
    const token = params.token;
    
    const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token.");
        }
    }, [token]);

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword: passwords.newPassword
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to reset password");
                setLoading(false);
                return;
            }

            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="form-container" style={{ paddingTop: "4rem" }}>
                <div className="form-card" style={{ textAlign: "center" }}>
                    <h1 className="form-title" style={{ marginBottom: "1rem" }}>✅ Password Reset</h1>
                    <p className="form-subtitle">Your password has been updated successfully!</p>
                    <div style={{ marginTop: "2rem" }}>
                        <Link href="/login" className="btn btn-primary btn-block btn-lg" style={{ display: "inline-block", textDecoration: "none" }}>
                            Proceed to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container" style={{ paddingTop: "4rem" }}>
            <div className="form-card">
                <h1 className="form-title">🔐 Set New Password</h1>
                <p className="form-subtitle">Enter your new secure password below</p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleReset}>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Min 6 characters"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Re-enter password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-footer">
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || !token}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span> Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
