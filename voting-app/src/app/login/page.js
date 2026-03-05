"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    console.log("CLIENT: LoginPage component mounted");
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "student",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                setLoading(false);
                return;
            }

            if (data.role === "admin") {
                router.push("/admin/dashboard");
            } else {
                router.push("/student/dashboard");
            }
        } catch {
            setError("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{ paddingTop: "4rem" }}>
            <div className="form-card">
                <h1 className="form-title">🗳️ BlockVote</h1>
                <p className="form-subtitle">Sign in to your account</p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">I am a</label>
                        <select
                            className="form-select"
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({ ...formData, role: e.target.value })
                            }
                        >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@college.edu"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="form-footer">
                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span> Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </div>
                </form>

                <div className="form-link">
                    Student?{" "}
                    <Link href="/register">Create an account</Link>
                </div>
                <div className="form-link">
                    Admin?{" "}
                    <Link href="/admin/register">Register as admin</Link>
                </div>
            </div>
        </div>
    );
}
