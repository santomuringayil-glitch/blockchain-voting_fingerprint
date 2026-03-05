const { ethers } = require('ethers');

async function checkGanache() {
    const GANACHE_URL = "http://127.0.0.1:7545";
    try {
        const provider = new ethers.JsonRpcProvider(GANACHE_URL);
        const accounts = await provider.listAccounts();
        console.log(`Ganache accounts found: ${accounts.length}`);
        process.exit(0);
    } catch (error) {
        console.error("Could not connect to Ganache:", error.message);
        process.exit(1);
    }
}
checkGanache();
