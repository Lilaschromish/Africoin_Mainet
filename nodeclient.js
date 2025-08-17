import fetch from 'node-fetch';
import readline from 'readline';
import { generateNewWallet, generateWalletFromMnemonic, signTransaction } from './wallet.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SEED_NODE = "https://africoin-seed-node-c641.onrender.com"; // replace with your Render URL after deployment

let wallet = null;

// Helper to ask question
function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

// Fetch balance
async function getBalance() {
  try {
    const res = await fetch(`${SEED_NODE}/balance/${wallet.address}`);
    const data = await res.json();
    console.log(`\nBalance: ${data.balance} AFC\n`);
  } catch (err) {
    console.log("Failed to fetch balance.");
  }
}

// Send transaction
async function sendTransaction() {
  const to = await ask("Recipient address: ");
  const amount = parseFloat(await ask("Amount to send: "));
  if (!to || !amount) return console.log("Invalid input.");

  const txData = { from: wallet.address, to, amount, data: {} };
  const signature = signTransaction(wallet, txData);

  try {
    const res = await fetch(`${SEED_NODE}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...txData, signature, fromPublicKey: wallet.publicKey })
    });
    const result = await res.json();
    console.log("Transaction result:", result.status || result);
  } catch (err) {
    console.log("Failed to send transaction.");
  }
}

// Join network
async function joinNetwork() {
  try {
    const res = await fetch(`${SEED_NODE}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: wallet.address })
    });
    const data = await res.json();
    console.log("Joined network successfully:", data);
  } catch (err) {
    console.log("Failed to join network:", err.message);
  }
}

// Main CLI
async function main() {
  console.log("Welcome to Africoin Mainet Node");

  const choice = await ask("Do you want to (1) Generate new wallet or (2) Restore from mnemonic? Enter 1 or 2: ");

  if (choice === "1") {
    wallet = generateNewWallet();
    console.log("\nNew wallet generated!");
  } else if (choice === "2") {
    const mnemonic = await ask("Enter your 12-word mnemonic: ");
    wallet = generateWalletFromMnemonic(mnemonic);
    console.log("\nWallet restored!");
  } else {
    console.log("Invalid choice.");
    rl.close();
    return;
  }

  console.log(`\nWallet Address: ${wallet.address}`);
  console.log(`Mnemonic: ${wallet.mnemonic}`);
  console.log(`Public Key: ${wallet.publicKey}`);

  // Join network
  await joinNetwork();

  // Fetch initial balance
  await getBalance();

  // Start CLI loop
  while (true) {
    const action = await ask("\nSelect action: (1) Check balance (2) Send AFC (3) Exit: ");
    if (action === "1") {
      await getBalance();
    } else if (action === "2") {
      await sendTransaction();
    } else if (action === "3") {
      console.log("Exiting...");
      rl.close();
      break;
    } else {
      console.log("Invalid option.");
    }
  }
}

main();
