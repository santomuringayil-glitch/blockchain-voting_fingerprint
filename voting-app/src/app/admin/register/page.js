"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/admin-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                setLoading(false);
                return;
            }

            router.push("/admin/dashboard");
        } catch {
            setError("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    const update = (field) => (e) =>
        setFormData({ ...formData, [field]: e.target.value });

    return (
        <div className="form-container" style={{ paddingTop: "4rem" }}>
            <div className="form-card">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1rem", marginTop: "1rem" }}>
                    <img src="/logo.png" alt="BlockVote Logo" style={{ width: "64px", height: "64px", marginBottom: "1rem" }} />
                    <h1 className="form-title">BlockVote</h1>
                </div>
                <p className="form-subtitle">
                    Create a new administrator account
                </p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="admin_username"
                            value={formData.username}
                            onChange={update("username")}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="admin@college.edu"
                            value={formData.email}
                            onChange={update("email")}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={update("password")}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Re-enter"
                                value={formData.confirmPassword}
                                onChange={update("confirmPassword")}
                                required
                            />
                        </div>
                    </div>


                    <div className="form-footer">
                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span> Registering...
                                </>
                            ) : (
                                "Register as Admin"
                            )}
                        </button>
                    </div>
                </form>

                <div className="form-link">
                    Already registered? <Link href="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
