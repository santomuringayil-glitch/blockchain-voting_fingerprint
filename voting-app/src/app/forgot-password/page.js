"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: ID, 2: New Password
    const [identifier, setIdentifier] = useState("");
    const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleNext = (e) => {
        e.preventDefault();
        setError("");
        
        if (!identifier.trim()) {
            setError("Please enter your Student ID or Email");
            return;
        }
        setStep(2);
    };

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
            const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
            const isAvailable = await BiometricAuth.checkBiometry();

            if (!isAvailable.isAvailable) {
                setError("Biometrics are not available on this device.");
                setLoading(false);
                return;
            }

            const originalConsoleError = console.error;
            console.error = (...args) => {
                if (args[0] && typeof args[0] === 'string' && args[0].includes('cancelled')) return;
                if (args[0]?.message?.includes('cancelled')) return;
                originalConsoleError(...args);
            };

            let deviceId = null;
            try {
                await BiometricAuth.authenticate({
                    reason: "Verify your identity to reset password",
                    cancelTitle: "Cancel",
                    allowDeviceCredential: true
                });

                // Get unique device ID if authentication succeeds
                const { Device } = await import('@capacitor/device');
                const device = await Device.getId();
                deviceId = device.identifier;
            } catch (e) {
                if (e.code === 'userCancel' || e.message?.toLowerCase().includes('cancel')) {
                    setError("Biometric verification cancelled.");
                } else {
                    setError("Biometric verification failed.");
                }
                setLoading(false);
                console.error = originalConsoleError;
                return;
            } finally {
                console.error = originalConsoleError;
            }

            // Authentication succeeded, send to backend
            const secureBiometricToken = `bio-${deviceId}`;

            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier,
                    newPassword: passwords.newPassword,
                    deviceId: secureBiometricToken
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to reset password");
                setLoading(false);
                return;
            }

            alert("🎉 Password reset successfully! You can now log in.");
            router.push("/login");

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
                    onClick={() => {
                        if (step === 2) setStep(1);
                        else router.back();
                    }} 
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
                <h1 className="form-title" style={{ marginTop: "1rem" }}>🔐 Reset Password</h1>
                <p className="form-subtitle">Verify your identity with your device fingerprint</p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleNext}>
                        <div className="form-group">
                            <label className="form-label">Student ID or Email</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your ID or Email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-footer">
                            <button type="submit" className="btn btn-primary btn-block btn-lg">
                                Next
                            </button>
                        </div>
                    </form>
                ) : (
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
                            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner"></span> Verifying Fingerprint...
                                    </>
                                ) : (
                                    "Scan Fingerprint & Reset"
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="form-link">
                    Remembered your password? <Link href="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
