"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => {
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  return (
    <div className="loading-container" style={{ minHeight: "100vh", textAlign: "center" }}>
      <div className="spinner"></div>
      <p style={{ marginTop: "1rem" }}>Opening BlockVote...</p>

      {/* Fallback link if auto-redirect hangs */}
      <div style={{ marginTop: "2rem" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Taking too long?</p>
        <Link href="/login" className="btn btn-secondary btn-sm" style={{ marginTop: "0.5rem" }}>
          Go to Login Page
        </Link>
      </div>
    </div>
  );
}
