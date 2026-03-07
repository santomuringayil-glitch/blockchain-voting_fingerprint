# 🗳️ BlockVote - Decentralized Blockchain Voting System

A highly secure, full-stack electronic voting application engineered for universities and organizations. BlockVote leverages **Ethereum Smart Contracts (Ganache)** to guarantee immutable election results, coupled with **MongoDB** for rapid off-chain data management. 

The system features native Android mobile application support via **Capacitor** with integrated **Hardware Biometric Authentication** (Fingerprint/FaceID) to strictly enforce a "One Student, One Phone" policy, entirely eliminating electoral fraud.

## 🌟 Key Features

### Security & Integrity
- **Blockchain Core**: Votes are cryptographically hashed and permanently recorded on a local Ethereum blockchain network (via Truffle/Ganache), ensuring results can never be tampered with or deleted.
- **Hardware Biometrics**: Utilizes `@aparajita/capacitor-biometric-auth` to anchor a student's identity to their physical device hardware (DeviceID + fingerprint scanning).
- **Dual Password Reset**: Secure account recovery options including Biometric Hardware verification and time-limited JWT Email links (via Nodemailer).

### Admin Dashboard (Election Commission)
- Create dynamic elections with custom or auto-generated Election IDs.
- Deploy isolated, temporary Smart Contracts for *each individual election*.
- Register candidates to elections, complete with manifestos, departments, and **Base64 compressed profile pictures**.
- Monitor live blockchain network statistics and election participation metrics.
- Manually trigger absolute end-times to halt the smart contract and permanently publish results.

### Student Voter Platform
- Cross-platform web interface and Android APK bundle.
- Secure, token-based authentication session via Next.js middleware.
- Live upcoming, active, and past election status feeds.
- Interactive candidate review with portrait previews.
- One-click biometric transaction signing to cast votes directly to the smart contract.

---

## 🛠️ Tech Stack Architecture

**Frontend:** Next.js (React 15.x), Vanilla CSS, Lucide Icons  
**Backend:** Next.js API Routes (Node.js runtime)  
**Database:** MongoDB via Mongoose (Off-chain user schemas & candidate profiles)  
**Blockchain:** Solidity (Smart Contracts), Ethers.js v6, Ganache (Local RPC Network)  
**Mobile:** Android Studio, Capacitor (`@capacitor/core`, `@capacitor/device`)  
**Auth/Security:** bcryptjs (Hashing), JSON Web Tokens (Email Links), Native Biometrics  

---

## 🚀 Getting Started (Development Installation)

### Prerequisites
1. **Node.js** (v18+)
2. **MongoDB** (Local instance running on `mongodb://127.0.0.1:27017` or cloud URI)
3. **Ganache Desktop GUI** (Running on port `7545`)
4. **Android Studio** (If building the mobile APK)

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/santomuringayil-glitch/blockchain.git
cd blockchain/voting-app

# Install Node dependencies
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory and configure the variables:

```env
# MongoDB Connection
MONGODB_URI="mongodb://127.0.0.1:27017/voting-system"
JWT_SECRET="generate-a-random-secure-string-here"

# Blockchain RPC (Ganache Default)
NEXT_PUBLIC_GANACHE_URL="http://127.0.0.1:7545"

# Nodemailer SMTP Configuration (For forgot password flow)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your.gmail@gmail.com"
EMAIL_PASS="your-16-char-app-password"

# App Base URL (Important for mobile WiFi LAN testing and emailed links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Smart Contract Deployment
You must have Ganache running locally and visually see accounts generated. 

We need to dynamically compile and deploy our root `VotingSystem` and `AdminDirectory` controllers:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```
*(Ensure the deploy script syncs the new contract addresses inside your backend config logic).*

### 4. Running the Development Server
```bash
# Binds to 0.0.0.0 to enable mobile Android LAN access via Capacitor
npm run dev -H 0.0.0.0
```
Open `http://localhost:3000` in your browser. 

*You must first navigate to `/admin/register` to create the master root account, then you can log in as admin at `/login` to begin creating elections!*

---

## 📱 Compiling the Android App (Capacitor)

The Next.js web application is bundled as a native Android APK using Capacitor to leverage hardware APIs.

1. Ensure your Next.js project is fully built:
```bash
npm run build
```
2. Sync the exported `out/` HTML/JS files into the Android project folder:
```bash
npx cap sync android
```
3. Open the Android project in Android Studio to compile the APK, or build via terminal:
```bash
npx cap open android
# OR
npx cap run android
```

---

## 🔒 Security Best Practices for Production
- **Never expose your Ganache/Ethereum Private Keys.** The current setup uses Ganache Account `[0]` automatically holding ether for deploying candidate transactions. In production (e.g., Polygon/Ethereum Mainnet), you must integrate injected wallets (like MetaMask/WalletConnect) or a secure backend transaction relayer.
- **Change `MONGODB_URI`** to a secure Atlas Cluster with proper IP whitelisting.
- **Change `JWT_SECRET`** to a secure randomly generated cryptographic string before releasing.
