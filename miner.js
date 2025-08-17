import { Blockchain } from './blockchain.js';
import { sleep } from './utils.js';

export const blockchain = new Blockchain();

export async function startMining(minerAddresses) {
  console.log('Mining started...');
  while (true) {
    const block = await blockchain.minePendingTransactions(minerAddresses);
    console.log(`New block mined: ${block.hash} with ${block.transactions.length} transactions`);
    await sleep(blockchain.blockTime);
  }
}
