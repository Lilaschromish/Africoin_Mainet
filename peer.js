import WebSocket from 'ws';
import { blockchain } from './miner.js';

export const peers = [];

export function connectToPeer(url) {
  const ws = new WebSocket(url);
  ws.on('open', () => {
    console.log('Connected to peer:', url);
    ws.send(JSON.stringify({ type: 'requestChain' }));
  });
  ws.on('message', message => {
    const data = JSON.parse(message);
    if (data.type === 'chain') {
      if (data.chain.length > blockchain.chain.length) {
        blockchain.chain = data.chain;
      }
    }
  });
  peers.push(ws);
}

export function broadcastChain() {
  const message = JSON.stringify({ type: 'chain', chain: blockchain.chain });
  peers.forEach(ws => ws.send(message));
}
