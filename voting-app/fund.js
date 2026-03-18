const { ethers } = require('ethers');

const GANACHE_URL = "http://127.0.0.1:7545";

async function main() {
    const provider = new ethers.JsonRpcProvider(GANACHE_URL);
    const accounts = await provider.listAccounts();
    const adminSigner = accounts[0];

    console.log("Admin account:", adminSigner.address);
    console.log("Admin balance:", ethers.formatEther(await provider.getBalance(adminSigner.address)));

    for (let i = 2; i < 5; i++) {
        const studentSigner = accounts[i];
        if (!studentSigner) continue;
        
        console.log(`Funding account ${i}:`, studentSigner.address);
        const tx = await adminSigner.sendTransaction({
            to: studentSigner.address,
            value: ethers.parseEther("1.0") // Send 1 ETH
        });
        await tx.wait();
        console.log("Successfully funded!");
    }

    process.exit(0);
}

main().catch(console.error);
