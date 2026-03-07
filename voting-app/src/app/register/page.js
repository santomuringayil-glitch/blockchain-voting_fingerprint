"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        studentId: "",
        department: "",
        year: "1",
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

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }


        setLoading(true);

        try {
            // STEP 1: Get Device ID for uniqueness check before creating account
            let deviceId = null;
            let secureBiometricToken = null;
            let biometricsAvailable = false;

            try {
                const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
                const isAvailable = await BiometricAuth.checkBiometry();

                if (isAvailable.isAvailable) {
                    biometricsAvailable = true;
                    const { Device } = await import('@capacitor/device');
                    const device = await Device.getId();
                    deviceId = device.identifier;
                    secureBiometricToken = `bio-${deviceId}`;
                }
            } catch (e) {
                console.warn("Biometrics plugin not available:", e);
            }

            // STEP 2: Create Account (will fail if device is duplicate)
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    studentId: formData.studentId,
                    department: formData.department,
                    year: formData.year,
                    password: formData.password,
                    deviceId: deviceId, // Send device ID for pre-check
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                setLoading(false);
                return;
            }

            // STEP 3: Prompt for actual Fingerprint Scan if account creation succeeds
            if (biometricsAvailable && secureBiometricToken) {
                const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth'); // Re-import for scope
                const originalConsoleError = console.error;
                console.error = (...args) => {
                    if (args[0] && typeof args[0] === 'string' && args[0].includes('cancelled')) return;
                    if (args[0]?.message?.includes('cancelled')) return;
                    originalConsoleError(...args);
                };

                try {
                    await BiometricAuth.authenticate({
                        reason: "Register your fingerprint for secure voting",
                        cancelTitle: "Skip for now",
                        allowDeviceCredential: true
                    });

                    // STEP 4: Save Biometric Token to DB
                    const bioRes = await fetch("/api/auth/register-biometric", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ biometricToken: secureBiometricToken }),
                    });

                    if (bioRes.ok) {
                        alert("🎉 Account created & Fingerprint successfully registered!");
                    } else {
                        const errorData = await bioRes.json();
                        alert(`Account created, but Fingerprint Registration Failed: ${errorData.error}`);
                    }
                } catch (e) {
                    if (e.code === 'userCancel' || e.message?.toLowerCase().includes('cancel')) {
                        console.log("User skipped biometric registration.");
                        alert("Account created. You skipped fingerprint registration.");
                    } else {
                        console.warn("Biometric error during registration:", e);
                    }
                } finally {
                    console.error = originalConsoleError;
                }
            } else {
                alert("Account created successfully!");
            }

            router.push("/student/dashboard");
        } catch {
            setError("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    const update = (field) => (e) =>
        setFormData({ ...formData, [field]: e.target.value });

    return (
        <div className="form-container" style={{ paddingTop: "2rem" }}>
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
                <h1 className="form-title" style={{ marginTop: "1rem" }}>🗳️ Student Registration</h1>
                <p className="form-subtitle">
                    Create your BlockVote account to participate in elections
                </p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={update("fullName")}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@college.edu"
                                value={formData.email}
                                onChange={update("email")}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Student ID</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="21CS045"
                                value={formData.studentId}
                                onChange={update("studentId")}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <select
                                className="form-select"
                                value={formData.department}
                                onChange={update("department")}
                                required
                            >
                                <option value="">Select</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Civil">Civil</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Information Technology">Information Technology</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Year</label>
                            <select
                                className="form-select"
                                value={formData.year}
                                onChange={update("year")}
                                required
                            >
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
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
                                placeholder="Re-enter password"
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
                                    <span className="spinner"></span> Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>
                </form>

                <div className="form-link">
                    Already have an account? <Link href="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
