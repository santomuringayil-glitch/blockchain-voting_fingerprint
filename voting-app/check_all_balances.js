const { ethers } = require('ethers');

async function checkBalances() {
    const GANACHE_URL = "http://127.0.0.1:7545";
    const provider = new ethers.JsonRpcProvider(GANACHE_URL);
    const accounts = await provider.listAccounts();

    console.log("Ganache Account Balances:");
    for (let i = 0; i < accounts.length; i++) {
        const balance = await provider.getBalance(accounts[i].address);
        console.log(`${i}: ${accounts[i].address} -> ${ethers.formatEther(balance)} ETH`);
    }
    process.exit(0);
}

checkBalances();
