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

// Voting contract bytecode placeholder — will be read from artifacts after compilation
let _bytecode = null;

export function getProvider() {
    const url = process.env.GANACHE_URL || "http://127.0.0.1:7545";
    return new ethers.JsonRpcProvider(url);
}

export function getContract(contractAddress, signerOrProvider) {
    return new ethers.Contract(contractAddress, VotingABI, signerOrProvider);
}

export async function getAdminSigner() {
    const provider = getProvider();
    const accounts = await provider.listAccounts();
    // First account is always the admin
    return accounts[0];
}

export async function getStudentSigner(walletIndex) {
    const provider = getProvider();
    const accounts = await provider.listAccounts();
    if (walletIndex >= accounts.length) {
        throw new Error("No more Ganache accounts available");
    }
    return accounts[walletIndex];
}

export async function deployVotingContract() {
    const provider = getProvider();
    const accounts = await provider.listAccounts();
    const adminSigner = accounts[0]; // first Ganache account = admin

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
    // This will be managed by counting students in the DB
    // Wallet index 0 is reserved for admin
    // Students get indices 1, 2, 3, ...
    return null; // caller should pass in the count
}
