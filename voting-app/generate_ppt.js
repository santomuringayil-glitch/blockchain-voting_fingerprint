const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "BlockVote Team";
pptx.title = "BlockVote — Technical Specifications";

// Color palette
const BG = "0A0A1A";
const BG2 = "111127";
const ACCENT = "6366F1";
const ACCENT2 = "8B5CF6";
const TEXT = "F1F1F7";
const TEXT2 = "9CA3AF";
const GREEN = "10B981";
const ORANGE = "F59E0B";

// Helper function
function addSlide(title, items, highlight = null) {
    const slide = pptx.addSlide();
    slide.background = { color: BG };

    // Top accent line
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.05, fill: { color: ACCENT } });

    // Title
    slide.addText(title, {
        x: 0.8, y: 0.4, w: "90%", h: 0.7,
        fontSize: 28, fontFace: "Arial", color: ACCENT, bold: true,
    });

    if (highlight) {
        slide.addText(highlight, {
            x: 0.8, y: 1.1, w: "90%", h: 0.5,
            fontSize: 14, fontFace: "Arial", color: TEXT2, italic: true,
        });
    }

    let yPos = highlight ? 1.7 : 1.3;
    for (const item of items) {
        if (item.type === "bullet") {
            slide.addText(item.text, {
                x: 1.0, y: yPos, w: "85%", h: 0.4,
                fontSize: 14, fontFace: "Arial", color: TEXT, bullet: { code: "2023", color: ACCENT },
            });
            yPos += 0.42;
        } else if (item.type === "sub") {
            slide.addText(item.text, {
                x: 1.5, y: yPos, w: "80%", h: 0.35,
                fontSize: 12, fontFace: "Arial", color: TEXT2, bullet: { code: "2022", color: TEXT2 },
            });
            yPos += 0.35;
        } else if (item.type === "table") {
            const rows = item.rows.map((row, i) =>
                row.map(cell => ({
                    text: cell,
                    options: {
                        fontSize: 11, fontFace: "Arial",
                        color: i === 0 ? ACCENT : TEXT,
                        bold: i === 0,
                        fill: { color: i === 0 ? BG2 : (i % 2 === 0 ? "0D0D22" : BG) },
                        border: [{ pt: 0.5, color: "2A2A4A" }],
                        valign: "middle",
                    }
                }))
            );
            slide.addTable(rows, {
                x: 0.8, y: yPos, w: item.w || 11.5,
                colW: item.colW,
                rowH: 0.4,
            });
            yPos += rows.length * 0.4 + 0.2;
        }
    }
    return slide;
}

// ============ SLIDE 1: Title ============
const s1 = pptx.addSlide();
s1.background = { color: BG };
s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.06, fill: { color: ACCENT } });
s1.addText("🗳️ BlockVote", {
    x: 0, y: 1.5, w: "100%", h: 1.2,
    fontSize: 52, fontFace: "Arial", color: ACCENT, bold: true, align: "center",
});
s1.addText("Blockchain-Based Decentralized Voting System", {
    x: 0, y: 2.7, w: "100%", h: 0.6,
    fontSize: 22, fontFace: "Arial", color: TEXT, align: "center",
});
s1.addText("Technical Specifications", {
    x: 0, y: 3.5, w: "100%", h: 0.5,
    fontSize: 18, fontFace: "Arial", color: TEXT2, align: "center",
});
s1.addShape(pptx.ShapeType.rect, { x: 4.5, y: 4.2, w: 4.3, h: 0.04, fill: { color: ACCENT2 } });

// ============ SLIDE 2: Architecture ============
addSlide("System Architecture", [
    { type: "bullet", text: "Client Layer → Android App (Capacitor WebView on student's phone)" },
    { type: "bullet", text: "Application Layer → Next.js 15 (React frontend + API backend in one)" },
    { type: "bullet", text: "Database Layer → MongoDB (user data, elections, candidates)" },
    { type: "bullet", text: "Blockchain Layer → Ganache Ethereum Network (immutable vote records)" },
    { type: "bullet", text: "The Android app communicates with Next.js over Wi-Fi (HTTP requests)" },
    { type: "bullet", text: "Next.js talks to MongoDB for user data and Ganache for blockchain operations" },
], "A hybrid architecture combining traditional database storage with blockchain immutability");

// ============ SLIDE 3: Next.js + React ============
addSlide("Next.js 15 + React 19", [
    { type: "table", rows: [
        ["Aspect", "Detail"],
        ["Technology", "Next.js 15.1.0 (Full-Stack Framework) + React 19.0.0 (UI Library)"],
        ["Role", "Frontend pages AND backend API routes in a single project"],
        ["Why Chosen", "One codebase, one server — no need for separate Express.js backend"],
        ["Frontend", "React components render login, dashboards, voting, and results pages"],
        ["Backend", "API routes in src/app/api/* handle auth, elections, voting logic"],
        ["Dev Command", "npm run dev — starts both frontend and backend simultaneously"],
    ], colW: [2.0, 9.5] }
]);

// ============ SLIDE 4: MongoDB ============
addSlide("MongoDB + Mongoose 8.8.0", [
    { type: "table", rows: [
        ["Aspect", "Detail"],
        ["Technology", "MongoDB (NoSQL Database) + Mongoose (ODM Library)"],
        ["Role", "Stores all user data, elections, candidates, fingerprints, results"],
        ["Why Chosen", "Flexible schema for complex nested data like election results"],
        ["Connection", "mongodb://127.0.0.1:27017/voting-system (runs locally)"],
    ], colW: [2.0, 9.5] },
    { type: "bullet", text: "Collections: students, admins, elections, candidates, fingerprints" },
    { type: "bullet", text: "Mongoose provides schema validation (required fields, unique emails)" },
    { type: "bullet", text: "Cached connection pattern prevents multiple connections during hot-reload" },
]);

// ============ SLIDE 5: Solidity + Ganache ============
addSlide("Solidity + Ganache (Blockchain)", [
    { type: "table", rows: [
        ["Aspect", "Detail"],
        ["Smart Contract", "Voting.sol (Solidity 0.8.19) — handles vote recording"],
        ["Blockchain", "Ganache — local Ethereum testnet (free, no real crypto needed)"],
        ["Compiler", "Hardhat 2.22.15 — compiles .sol into deployable bytecode"],
        ["JS Bridge", "Ethers.js 6.13.4 — connects Next.js backend to blockchain"],
    ], colW: [2.0, 9.5] },
    { type: "bullet", text: "Each election deploys a NEW smart contract instance" },
    { type: "bullet", text: "Votes are permanently recorded — cannot be altered or deleted" },
    { type: "bullet", text: "hasVoted mapping prevents any wallet from voting twice" },
    { type: "bullet", text: "onlyAdmin modifier restricts critical functions to the deployer" },
]);

// ============ SLIDE 6: Capacitor + Biometrics ============
addSlide("Capacitor + Biometric Authentication", [
    { type: "table", rows: [
        ["Aspect", "Detail"],
        ["Technology", "Capacitor 8.1.0 — wraps web app into native Android APK"],
        ["Biometrics", "@aparajita/capacitor-biometric-auth — fingerprint scanner access"],
        ["Device ID", "@capacitor/device — unique device identifier for security"],
    ], colW: [2.0, 9.5] },
    { type: "bullet", text: "Web app runs inside Android WebView — no Java/Kotlin code needed" },
    { type: "bullet", text: "Fingerprint required during registration AND before casting votes" },
    { type: "bullet", text: "Device ID linked to student account — one device per student" },
    { type: "bullet", text: "Falls back to PIN/Pattern if fingerprint isn't available" },
]);

// ============ SLIDE 7: Security ============
addSlide("Security Technologies", [
    { type: "table", rows: [
        ["Technology", "Purpose", "How It Works"],
        ["bcryptjs 2.4.3", "Password Hashing", "12 salt rounds — resistant to brute force"],
        ["JWT (jsonwebtoken)", "Session Management", "Encrypted token in HTTP-only cookie, 24h expiry"],
        ["Biometric Auth", "Identity Verification", "Fingerprint scan before registration & voting"],
        ["Solidity Modifiers", "Blockchain Access Control", "onlyAdmin, electionIsActive guards"],
        ["Middleware", "Route Protection", "Redirects unauthenticated users to login"],
    ], colW: [2.5, 3.0, 6.0] },
]);

// ============ SLIDE 8: Supporting Tools ============
addSlide("Supporting Technologies", [
    { type: "table", rows: [
        ["Technology", "Version", "Purpose"],
        ["Nodemailer", "8.0.1", "Sends password reset emails via Gmail SMTP"],
        ["Chart.js", "4.4.6", "Renders vote distribution bar chart on results page"],
        ["react-chartjs-2", "5.2.0", "React wrapper for Chart.js integration"],
        ["Zod", "3.23.8", "Validates incoming API data (correct types/formats)"],
        ["ESLint", "8.x", "Code quality and style enforcement"],
    ], colW: [2.5, 1.5, 7.5] },
]);

// ============ SLIDE 9: Security Summary ============
addSlide("Threat vs Protection Matrix", [
    { type: "table", rows: [
        ["Threat", "Protection", "Technology"],
        ["Vote Tampering", "Immutable blockchain storage", "Solidity + Ganache"],
        ["Double Voting", "hasVoted mapping on-chain", "Smart Contract"],
        ["Identity Fraud", "Biometric + one device per account", "Capacitor Biometric"],
        ["Password Theft", "bcrypt hash (12 rounds)", "bcryptjs"],
        ["Session Hijacking", "HTTP-only JWT, 24h expiry", "jsonwebtoken"],
        ["Unauthorized Admin", "Secret key for admin registration", "Environment Variable"],
    ], colW: [2.5, 4.5, 4.5] },
]);

// ============ SLIDE 10: Thank You ============
const sLast = pptx.addSlide();
sLast.background = { color: BG };
sLast.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.06, fill: { color: ACCENT } });
sLast.addText("Thank You!", {
    x: 0, y: 2.0, w: "100%", h: 1.2,
    fontSize: 48, fontFace: "Arial", color: ACCENT, bold: true, align: "center",
});
sLast.addText("BlockVote — Secure, Transparent, Decentralized Voting", {
    x: 0, y: 3.2, w: "100%", h: 0.6,
    fontSize: 18, fontFace: "Arial", color: TEXT2, align: "center",
});

// Save
const outputPath = process.cwd() + "\\BlockVote_Technical_Specs.pptx";
pptx.writeFile({ fileName: outputPath }).then(() => {
    console.log("✅ PPT saved to:", outputPath);
}).catch(err => {
    console.error("Error:", err);
});
