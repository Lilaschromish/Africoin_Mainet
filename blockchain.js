import { sha256, getCurrentTimestamp } from './utils.js';
import fs from 'fs';
import { signTransaction, verifyTransactionSignature } from './wallet.js';

export class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.miningReward = 54; // AFC
    this.difficulty = 4; // PoW difficulty (adjustable)
    this.blockTime = 5.4 * 60 * 1000; // 5.4 minutes
    this.totalSupply = 54000000;
    this.loadChain();
    if (this.chain.length === 0) {
      this.createGenesisBlock();
    }
  }

  createGenesisBlock() {
    const genesisBlock = this.createBlock(0, [], '0');
    this.chain.push(genesisBlock);
    this.saveChain();
  }

  createBlock(nonce, transactions, previousHash) {
    const block = {
      index: this.chain.length,
      timestamp: getCurrentTimestamp(),
      transactions,
      nonce,
      previousHash,
      hash: ''
    };
    block.hash = this.calculateHash(block);
    return block;
  }

  calculateHash(block) {
    return sha256(
      block.index + block.previousHash + block.timestamp + JSON.stringify(block.transactions) + block.nonce
    );
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(tx) {
    if (!tx.from || !tx.to || !tx.amount) return false;
    if (tx.from !== 'SYSTEM' && !verifyTransactionSignature(tx, tx.fromPublicKey)) return false;
    this.pendingTransactions.push(tx);
    return true;
  }

  async minePendingTransactions(minerAddresses) {
    const start = Date.now();
    let nonce = 0;
    const previousHash = this.getLastBlock().hash;
    let hash = this.calculateHash({ index: this.chain.length, previousHash, timestamp: getCurrentTimestamp(), transactions: this.pendingTransactions, nonce });
    while (!hash.startsWith('0'.repeat(this.difficulty))) {
      nonce++;
      hash = this.calculateHash({ index: this.chain.length, previousHash, timestamp: getCurrentTimestamp(), transactions: this.pendingTransactions, nonce });
      if (Date.now() - start > this.blockTime) break; // prevent infinite loop
    }
    const block = { index: this.chain.length, timestamp: getCurrentTimestamp(), transactions: this.pendingTransactions, nonce, previousHash, hash };
    this.chain.push(block);
    this.distributeRewards(minerAddresses);
    this.pendingTransactions = [];
    this.saveChain();
    return block;
  }

  distributeRewards(minerAddresses) {
    let rewardLeft = this.miningReward;
    const sortedMiners = minerAddresses.slice(0, 3);
    for (let i = 0; i < sortedMiners.length; i++) {
      const share = rewardLeft * 0.54;
      this.addTransaction({ from: 'SYSTEM', to: sortedMiners[i], amount: share });
      rewardLeft -= share;
    }
    // Remaining distributed to all miners equally
    const perMiner = rewardLeft / minerAddresses.length;
    minerAddresses.forEach(addr => this.addTransaction({ from: 'SYSTEM', to: addr, amount: perMiner }));
  }

  getBalance(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.to === address) balance += tx.amount;
        if (tx.from === address) balance -= tx.amount;
      }
    }
    return balance;
  }

  saveChain() {
    fs.writeFileSync('africoin.json', JSON.stringify(this.chain, null, 2));
  }

  loadChain() {
    try {
      if (fs.existsSync('africoin.json')) {
        this.chain = JSON.parse(fs.readFileSync('africoin.json'));
      }
    } catch (e) {
      console.log('Failed to load chain, creating new.');
      this.chain = [];
    }
  }
}
