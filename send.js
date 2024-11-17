require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Ambil data sensitif dari .env
const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL;

// Buat provider dan wallet
const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

// Fungsi utama untuk mengirim Ether
async function sendEther() {
    try {
        // Baca file addresses.txt
        const addresses = fs.readFileSync("addresses.txt", "utf8").split("\n").filter(Boolean);
        
        // Cek saldo wallet
        const balance = await provider.getBalance(wallet.address);
        console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);

        // Jumlah yang dikirim ke setiap alamat
        const amountToSend = ethers.parseEther("0.0001"); // Ubah sesuai kebutuhan

        // Pastikan saldo cukup
        const totalAmount = amountToSend * BigInt(addresses.length); // Pastikan addresses.length diubah ke BigInt
if (balance < totalAmount) {
    console.error("Insufficient funds!");
    return;
}

        // Kirim Ether ke setiap alamat
        for (const address of addresses) {
            console.log(`Sending ${ethers.formatEther(amountToSend)} ETH to ${address}...`);
            const tx = await wallet.sendTransaction({
                to: address,
                value: amountToSend
            });
            await tx.wait();
            console.log(`Transaction successful: ${tx.hash}`);
        }

        console.log("All transactions completed.");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// Jalankan fungsi
sendEther();
