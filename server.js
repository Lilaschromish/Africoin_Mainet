import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { blockchain } from './miner.js';
import { generateNewWallet } from './wallet.js';
import { startMining } from './miner.js';

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

let minerAddresses = [];

app.get('/wallet', (req, res) => {
  const wallet = generateNewWallet();
  res.json(wallet);
});

app.get('/balance/:address', (req, res) => {
  const balance = blockchain.getBalance(req.params.address);
  res.json({ address: req.params.address, balance });
});

app.post('/transaction', (req, res) => {
  const tx = req.body;
  const success = blockchain.addTransaction(tx);
  if (success) res.json({ status: 'Transaction added' });
  else res.status(400).json({ status: 'Invalid transaction' });
});

app.get('/chain', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/join', (req, res) => {
  const { address } = req.body;
  if (!minerAddresses.includes(address)) minerAddresses.push(address);
  res.json({ status: 'Joined network', minerAddresses });
});

// Start mining automatically
startMining(minerAddresses);

app.listen(3000, () => console.log('Seed node running on http://localhost:3000'));
