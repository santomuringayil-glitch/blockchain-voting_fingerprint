"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResultsPage() {
    const router = useRouter();
    const params = useParams();
    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/elections/${params.id}`)
            .then((r) => r.json())
            .then((data) => {
                setElection(data.election);
                setLoading(false);
            })
            .catch(() => router.push("/student/dashboard"));
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: "100vh" }}>
                <div className="spinner"></div>
                <span>Loading results...</span>
            </div>
        );
    }

    if (!election?.results) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <h3>Results Not Yet Published</h3>
                    <p>Check back later.</p>
                    <Link href="/student/dashboard" className="btn btn-primary mt-2">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const { results } = election;
    const colors = [
        "#6366f1", "#8b5cf6", "#a78bfa", "#3b82f6",
        "#10b981", "#f59e0b", "#ef4444", "#ec4899",
    ];

    const chartData = {
        labels: results.candidates.map((c) => c.name),
        datasets: [
            {
                label: "Votes",
                data: results.candidates.map((c) => c.votes),
                backgroundColor: results.candidates.map(
                    (_, i) => colors[i % colors.length] + "CC"
                ),
                borderColor: results.candidates.map(
                    (_, i) => colors[i % colors.length]
                ),
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        indexAxis: "y",
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                backgroundColor: "rgba(17, 17, 39, 0.95)",
                titleColor: "#f1f1f7",
                bodyColor: "#9ca3af",
                borderColor: "rgba(99, 102, 241, 0.3)",
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
            },
        },
        scales: {
            x: {
                ticks: { color: "#9ca3af", font: { family: "Inter" } },
                grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
                ticks: { color: "#f1f1f7", font: { family: "Inter", weight: 600 } },
                grid: { display: false },
            },
        },
    };

    return (
        <>
            <nav className="nav-bar">
                <Link href="/student/dashboard" className="nav-logo" style={{ textDecoration: "none" }}>
                    🗳️ BlockVote
                </Link>
                <Link href="/student/dashboard" className="btn btn-secondary btn-sm">
                    ← Back to Dashboard
                </Link>
            </nav>

            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{election.title} — Results</h1>
                        <p className="page-subtitle">
                            Published on{" "}
                            {new Date(results.publishedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <span className="badge badge-results">Results Published</span>
                </div>

                {/* Winner / Tie Banner */}
                {results.isTie ? (
                    <div className="winner-banner" style={{ borderColor: "rgba(245, 158, 11, 0.3)", background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(99, 102, 241, 0.15))" }}>
                        <h2>🤝 It's a Tie!</h2>
                        <h3 style={{ background: "linear-gradient(135deg, #f59e0b, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            {results.candidates
                                .filter(c => c.votes === results.candidates[0].votes)
                                .map(c => c.name)
                                .join(" & ")}
                        </h3>
                        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                            Each with {results.candidates[0].votes} vote{results.candidates[0].votes !== 1 ? "s" : ""} — Total Votes: {results.totalVotes}
                        </p>
                    </div>
                ) : (
                    <div className="winner-banner">
                        <h2>🏆 Winner</h2>
                        <h3>{results.winner}</h3>
                        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                            Total Votes: {results.totalVotes}
                        </p>
                    </div>
                )}

                {/* Chart */}
                <div className="chart-container">
                    <h3
                        style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            marginBottom: "1rem",
                            color: "var(--text-secondary)",
                        }}
                    >
                        Vote Distribution
                    </h3>
                    <Bar data={chartData} options={chartOptions} />
                </div>

                {/* Results Table */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Candidate</th>
                                <th>Party</th>
                                <th>Votes</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.candidates.map((candidate, index) => {
                                const highestVotes = results.candidates[0].votes;
                                const isTied = results.isTie && candidate.votes === highestVotes;
                                const rank = isTied ? 1 : index + 1;
                                return (
                                <tr key={index}>
                                    <td>
                                        <strong>{rank}</strong>
                                        {isTied && " 🤝"}
                                        {!results.isTie && index === 0 && " 🏆"}
                                    </td>
                                    <td>
                                        <strong>{candidate.name}</strong>
                                    </td>
                                    <td style={{ color: "var(--text-secondary)" }}>
                                        {candidate.party}
                                    </td>
                                    <td>
                                        <strong>{candidate.votes}</strong>
                                    </td>
                                    <td>
                                        {results.totalVotes > 0
                                            ? (
                                                (candidate.votes / results.totalVotes) *
                                                100
                                            ).toFixed(1) + "%"
                                            : "0%"}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
