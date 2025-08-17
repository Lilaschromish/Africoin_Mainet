const generateBtn = document.getElementById('generateWallet');
const walletDiv = document.getElementById('walletInfo');
const addressSpan = document.getElementById('address');
const mnemonicSpan = document.getElementById('mnemonic');
const qrCanvas = document.getElementById('qrcode');

generateBtn.addEventListener('click', async () => {
  const res = await fetch('/wallet');
  const wallet = await res.json();
  addressSpan.textContent = wallet.address;
  mnemonicSpan.textContent = wallet.mnemonic;
  walletDiv.classList.remove('hidden');
  QRCode.toCanvas(qrCanvas, wallet.address, function (error) {
    if (error) console.error(error);
  });
});
