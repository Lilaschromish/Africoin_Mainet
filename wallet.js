import { randomBytes } from 'crypto';
import pkg from 'elliptic';
const { ec: EC } = pkg;
import bip39 from 'bip39';
import hdkey from 'ethereumjs-wallet/hdkey.js';

const ec = new EC('secp256k1');

// Generate a new wallet
export function generateNewWallet() {
  const mnemonic = bip39.generateMnemonic();
  return generateWalletFromMnemonic(mnemonic);
}

// Restore wallet from mnemonic
export function generateWalletFromMnemonic(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) throw new Error('Invalid mnemonic');

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdwallet = hdkey.fromMasterSeed(seed);
  const key = hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
  const privateKey = key.getPrivateKeyString();
  const publicKey = key.getPublicKeyString();
  const address = 'AFC' + key.getAddress().toString('hex').toUpperCase().slice(0, 8);

  return { mnemonic, privateKey, publicKey, address };
}

// Sign a transaction
export function signTransaction(wallet, txData) {
  const key = ec.keyFromPrivate(wallet.privateKey.slice(2), 'hex');
  const msgHash = JSON.stringify(txData);
  const signature = key.sign(msgHash);
  return signature.toDER('hex');
}

// Verify a transaction signature
export function verifyTransactionSignature(tx) {
  const key = ec.keyFromPublic(tx.fromPublicKey.slice(2), 'hex');
  const msgHash = JSON.stringify({ from: tx.from, to: tx.to, amount: tx.amount, data: tx.data });
  return key.verify(msgHash, tx.signature);
}
