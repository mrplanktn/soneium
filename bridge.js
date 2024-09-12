const Web3 = require('web3');
const { ethers } = require('ethers');

// Konfigurasi Ethereum
const ethereumRpcUrl = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';
const ethereumPrivateKey = 'YOUR_ETHEREUM_PRIVATE_KEY';
const ethereumTokenAddress = 'ERC20_TOKEN_CONTRACT_ADDRESS_ON_ETHEREUM';

// Konfigurasi Soneium Testnet
const soneiumRpcUrl = 'https://rpc.minato.soneium.org';
const soneiumPrivateKey = 'YOUR_SONEIUM_PRIVATE_KEY';
const soneiumTokenAddress = 'ERC20_TOKEN_CONTRACT_ADDRESS_ON_SONEIUM';

// Inisialisasi Web3 dan Ethers
const web3 = new Web3(new Web3.providers.HttpProvider(ethereumRpcUrl));
const ethereumProvider = new ethers.JsonRpcProvider(ethereumRpcUrl);
const soneiumProvider = new ethers.JsonRpcProvider(soneiumRpcUrl);

// Token ABI (ERC20)
const tokenAbi = [
    "function transfer(address to, uint amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint)"
];

// Konfigurasi kontrak token
const ethereumTokenContract = new web3.eth.Contract(tokenAbi, ethereumTokenAddress);
const soneiumTokenContract = new ethers.Contract(soneiumTokenAddress, tokenAbi, soneiumProvider);

// Fungsi untuk memindahkan token dari Ethereum ke Soneium
async function bridgeTokens(amount, recipient) {
    try {
        // Setup Ethereum
        const ethereumAccount = web3.eth.accounts.privateKeyToAccount(ethereumPrivateKey);
        web3.eth.accounts.wallet.add(ethereumAccount);
        web3.eth.defaultAccount = ethereumAccount.address;

        const ethereumBalance = await ethereumTokenContract.methods.balanceOf(ethereumAccount.address).call();
        console.log(`Ethereum balance: ${web3.utils.fromWei(ethereumBalance, 'ether')} ETH`);

        if (parseFloat(web3.utils.fromWei(ethereumBalance, 'ether')) < amount) {
            console.log('Insufficient balance on Ethereum.');
            return;
        }

        // Kirim token ke Soneium Testnet
        const tx = await ethereumTokenContract.methods.transfer(recipient, web3.utils.toWei(amount.toString(), 'ether')).send({
            from: ethereumAccount.address,
            gas: 2000000
        });

        console.log('Transaction successful:', tx.transactionHash);

        // Setup Soneium
        const soneiumWallet = new ethers.Wallet(soneiumPrivateKey, soneiumProvider);

        // Cek saldo di Soneium
        const soneiumBalance = await soneiumTokenContract.balanceOf(soneiumWallet.address);
        console.log(`Soneium balance: ${ethers.utils.formatEther(soneiumBalance)} ETH`);

        // Kirim token ke alamat yang dituju
        const soneiumTokenWithSigner = soneiumTokenContract.connect(soneiumWallet);
        const txReceipt = await soneiumTokenWithSigner.transfer(recipient, ethers.utils.parseEther(amount.toString()));
        console.log('Soneium transaction successful:', txReceipt.hash);

    } catch (error) {
        console.error('Error bridging tokens:', error);
    }
}

// Contoh penggunaan
const amountToBridge = 1; // Jumlah token yang ingin dikirim
const recipientAddress = 'RECIPIENT_ADDRESS'; // Alamat penerima di Soneium Testnet

bridgeTokens(amountToBridge, recipientAddress);
