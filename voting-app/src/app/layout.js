import "./globals.css";

export const metadata = {
  title: "BlockVote — Blockchain Voting System",
  description:
    "A secure, transparent, and tamper-proof blockchain-based voting system for college elections.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
