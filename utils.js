import CryptoJS from 'crypto-js';

export function sha256(data) {
  return CryptoJS.SHA256(data).toString();
}

export function getCurrentTimestamp() {
  return Date.now();
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
