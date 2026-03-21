import { ethers } from "ethers";

// Voting contract ABI — generated from Voting.sol
export const VotingABI = [
    "constructor()",
    "function admin() view returns (address)",
    "function electionActive() view returns (bool)",
    "function candidateCount() view returns (uint256)",
    "function candidates(uint256) view returns (uint256 id, string name, uint256 voteCount)",
    "function hasVoted(address) view returns (bool)",
    "function addCandidate(string memory _name)",
    "function startElection()",
    "function vote(uint256 _candidateId)",
    "function endElection()",
    "function getCandidate(uint256 _candidateId) view returns (uint256, string memory, uint256)",
    "function getCandidateCount() view returns (uint256)",
    "function getElectionStatus() view returns (bool)",
    "function checkHasVoted(address _voter) view returns (bool)",
];

export function getProvider() {
    const url = process.env.GANACHE_URL || "https://ethereum-sepolia-rpc.publicnode.com";
    return new ethers.JsonRpcProvider(url);
}

export function getContract(contractAddress, signerOrProvider) {
    return new ethers.Contract(contractAddress, VotingABI, signerOrProvider);
}

export async function getAdminSigner() {
    const provider = getProvider();
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (privateKey) {
        return new ethers.Wallet(privateKey, provider);
    }
    // Fallback to Ganache (local dev)
    const accounts = await provider.listAccounts();
    return accounts[0];
}

export async function getStudentSigner(walletIndex) {
    // On Sepolia, we use the deployer key to submit votes on behalf of students
    // This is a simplified approach for a college project
    const provider = getProvider();
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (privateKey) {
        // Use a deterministic wallet derived from the deployer key + walletIndex
        const baseWallet = new ethers.Wallet(privateKey, provider);
        // For Sepolia, we use the same admin wallet to send vote transactions
        // since students don't have their own Sepolia wallets
        return baseWallet;
    }
    // Fallback to Ganache (local dev)
    const accounts = await provider.listAccounts();
    if (walletIndex >= accounts.length) {
        throw new Error("No more accounts available");
    }
    return accounts[walletIndex];
}

export async function deployVotingContract() {
    const provider = getProvider();
    let adminSigner;
    
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (privateKey) {
        adminSigner = new ethers.Wallet(privateKey, provider);
    } else {
        const accounts = await provider.listAccounts();
        adminSigner = accounts[0];
    }

    // Read compiled bytecode
    let bytecode;
    try {
        const fs = await import("fs");
        const path = await import("path");
        const artifactPath = path.join(
            process.cwd(),
            "artifacts",
            "contracts",
            "Voting.sol",
            "Voting.json"
        );
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        bytecode = artifact.bytecode;
    } catch (e) {
        throw new Error(
            "Contract not compiled. Run 'npx hardhat compile' first. Error: " +
            e.message
        );
    }

    const factory = new ethers.ContractFactory(VotingABI, bytecode, adminSigner);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    return address;
}

export async function getNextWalletIndex() {
    return null;
}
