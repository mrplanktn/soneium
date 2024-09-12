const Web3 = require('web3');
require('dotenv').config(); // Load environment variables from .env
const fs = require('fs');

// Retrieve environment variables
const soneiumProviderURL = process.env.SONEIUM_PROVIDER;
const privateKey = process.env.PRIVATE_KEY;
const fromAddress = process.env.FROM_ADDRESS;
const transferAmount = process.env.TRANSFER_AMOUNT;

// Read the list of addresses from JSON file
let recipients;
try {
    recipients = JSON.parse(fs.readFileSync('recipients.json', 'utf8'));
} catch (error) {
    console.error('Error reading recipients file:', error);
    process.exit(1);
}

// Initialize Web3 with provider URL
const soneiumWeb3 = new Web3(new Web3.providers.HttpProvider(soneiumProviderURL));

async function transferFunds() {
    try {
        // Check sender account balance
        const balance = await soneiumWeb3.eth.getBalance(fromAddress);
        console.log(`Balance of account ${fromAddress}: ${soneiumWeb3.utils.fromWei(balance, 'ether')} ETH`);

        // Iterate over recipients and send transactions
        for (let address of recipients) {
            // Prepare transaction details
            const tx = {
                from: fromAddress,
                to: address,
                value: soneiumWeb3.utils.toWei(transferAmount, 'ether'),
                gas: 21000, // Standard gas limit for ETH transfers
                gasPrice: await soneiumWeb3.eth.getGasPrice(),
                nonce: await soneiumWeb3.eth.getTransactionCount(fromAddress)
            };

            // Sign the transaction
            const signedTx = await soneiumWeb3.eth.accounts.signTransaction(tx, privateKey);

            // Send the signed transaction
            const receipt = await soneiumWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log(`Transaction successful: ${receipt.transactionHash} to ${address}`);
        }
    } catch (error) {
        console.error('Failed to transfer:', error);
    }
}

transferFunds();
