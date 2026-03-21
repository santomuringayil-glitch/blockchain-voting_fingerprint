# 🗳️ BlockVote - Decentralized Blockchain Voting System

### 🌐 [Live Application URL](https://blockchain-voting-fingerprint.vercel.app)

BlockVote is a highly secure, full-stack electronic voting application engineered for universities and organizations. This version is fully deployed to the cloud, leveraging **Ethereum Sepolia Testnet** for immutable records and **MongoDB Atlas** for scalable data management.

The system features an Android mobile application built with **Capacitor**, implementing **Hardware Biometric Authentication** to ensure a "One Student, One Phone" policy.

---

## 🚀 Live Production Stack
- **Frontend & Hosting**: [Vercel](https://vercel.com) (Next.js 15.x)
- **Blockchain Network**: [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Cloud Cluster)
- **Smart Contracts**: Solidity (Deployed via Hardhat)
- **Mobile Platform**: Android (Capacitor 8.1.0)
- **Email Service**: Nodemailer (Secure SMTP)

---

## 🌟 Key Features

### 🔐 Security & Integrity
- **Blockchain-Backed**: Every vote is a transaction on the Sepolia Testnet, making results globally verifiable and 100% immutable.
- **Biometric Locking**: Voting is anchored to physical device hardware using fingerprint/biometric scanning.
- **Email Authentication**: Secure password resets via time-limited JWT links.

### 🏛️ Admin Control (Election Commission)
- Create and manage real-time elections with unique IDs.
- Register candidates with manifestos and profile images.
- Monitor live blockchain statistics.
- Results are permanently published once the election is finalized on the smart contract.

### 🗳️ Student Voter Experience
- Responsive web interface and native Android APK.
- Live feed of active, upcoming, and past elections.
- One-touch biometric voting for a seamless experience.

---

## 📱 Mobile App Installation
The Android application is available as a pre-built APK in the project root:
*   **`BlockVote_Debug.apk`**: Recommended for testing. Linked directly to the live Vercel cloud server.

---

## 🛠️ Local Development Setup

If you wish to run this project locally using Ganache:

### Prerequisites
1. **Node.js** (v18+)
2. **MongoDB** (Local or Atlas)
3. **Ganache Desktop** (Port 7545)
4. **Hardhat** (For contract compilation)

### Setup Steps
```bash
# 1. Clone & Install
git clone https://github.com/santomuringayil-glitch/blockchain-voting_fingerprint.git
cd blockchain-voting_fingerprint/voting-app
npm install

# 2. Configure Environment
# Copy .env.local and fill in your local MongoDB and Ganache details

# 3. Deploy Local Contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost

# 4. Run Development Server
npm run dev
```

---

## ✅ Deployment Status
- **Vercel Build**: [Passing](https://blockchain-voting-fingerprint.vercel.app)
- **Blockchain**: Sepolia Testnet Operational
- **Database**: MongoDB Atlas Cluster Active

**Developed for the 2026 Academic Session.** 🎓
