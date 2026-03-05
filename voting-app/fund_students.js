const { ethers } = require('ethers');

async function fundStudents() {
    const GANACHE_URL = "http://127.0.0.1:7545";
    const provider = new ethers.JsonRpcProvider(GANACHE_URL);
    const accounts = await provider.listAccounts();
    const adminSigner = accounts[0];

    console.log(`Admin Address: ${adminSigner.address}`);

    // Fund all accounts from index 1 to the end
    for (let i = 1; i < accounts.length; i++) {
        const studentAddress = accounts[i].address;
        console.log(`Funding account ${i}: ${studentAddress}...`);

        try {
            const tx = await adminSigner.sendTransaction({
                to: studentAddress,
                value: ethers.parseEther("50.0")
            });
            await tx.wait();
            console.log(`✅ Funded index ${i} with 50 ETH`);
        } catch (e) {
            console.error(`❌ Failed to fund index ${i}:`, e.message);
        }
    }
    process.exit(0);
}

fundStudents();
