// public/main.js - FORMULARIO ACTUALIZADO
console.log("🚀 Formulario de certificados listo");

const CONTRACT_ADDRESS = "0x7BA96B6463bA70b4c5187a3606f583c101E83a16";
const SONIC_CHAIN_ID = 14601;

const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "guardarCertificado",
    "inputs": [
      { "name": "nombre", "type": "string", "internalType": "string" },
      { "name": "curso", "type": "string", "internalType": "string" },
      { "name": "nota", "type": "uint8", "internalType": "uint8" },
      { "name": "fecha", "type": "uint256", "internalType": "uint256" },
      { "name": "cid", "type": "string", "internalType": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

let provider, signer, contract;

async function init() {
  if (typeof ethers === 'undefined') {
    setTimeout(init, 500);
    return;
  }
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    console.log("✅ Provider listo");
  }
}

async function switchToSonic() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x3909" }]
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x3909",
          chainName: "Sonic Testnet",
          nativeCurrency: { name: "Sonic", symbol: "S", decimals: 18 },
          rpcUrls: ["https://rpc.testnet.soniclabs.com"]
        }]
      });
    }
  }
}

document.getElementById("cert-form").onsubmit = async (event) => {
  event.preventDefault();
  
  const nombre = document.getElementById("nombre").value;
  const curso = document.getElementById("curso").value;
  const nota = parseInt(document.getElementById("nota").value) || 0;
  const fecha = new Date(document.getElementById("fecha").value).getTime();
  const cid = document.getElementById("cid").value;
  
  const resultado = document.getElementById("resultado");
  
  if (!nombre || !curso || !fecha || !cid) {
    resultado.innerHTML = '<span style="color:red">❌ Completa todos los campos</span>';
    return;
  }
  
  resultado.innerHTML = '<span style="color:#185a9d">🔍 Conectando wallet...</span>';
  
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (parseInt(chainId, 16) !== SONIC_CHAIN_ID) {
      await switchToSonic();
      await new Promise(r => setTimeout(r, 2000));
    }
    
    if (!provider) await init();
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    resultado.innerHTML = '<span style="color:#185a9d">⏳ Enviando transacción...</span>';
    
    const tx = await contract.guardarCertificado(nombre, curso, nota, fecha, cid);
    
    resultado.innerHTML = `<span style="color:#090">✅ Transacción enviada!<br>Hash: ${tx.hash.slice(0, 20)}...</span>`;
    
    const receipt = await tx.wait();
    
    const verificationUrl = `https://verificador-xi.vercel.app/?hash=${tx.hash}`;
    
    // Generar QR
    const qrSection = document.getElementById("qr-section");
    qrSection.innerHTML = `
      <h3 style="margin-top:20px">📱 Código QR del certificado</h3>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verificationUrl)}" style="border:2px solid #185a9d; border-radius:10px; padding:10px; background:white;">
      <a href="${verificationUrl}" target="_blank" style="color:#185a9d; margin-top:10px; display:block;">🔗 Ver certificado online</a>
    `;
    
    resultado.innerHTML = `
      <div style="background:#e8f5e9; padding:15px; border-radius:10px; margin-top:15px;">
        🎉 CERTIFICADO REGISTRADO!<br><br>
        👤 ${nombre}<br>
        📚 ${curso}<br>
        ⭐ ${nota}<br>
        📅 ${new Date(fecha).toLocaleDateString()}<br>
        🔗 CID: ${cid}<br>
        📫 Hash: ${tx.hash}<br>
        🔢 Block: ${receipt.blockNumber}<br>
        <a href="https://testnet.soniclabs.com/tx/${tx.hash}" target="_blank">🔍 Ver en Sonic Explorer</a>
      </div>
    `;
    
    document.getElementById("cert-form").reset();
    
  } catch (error) {
    resultado.innerHTML = `<span style="color:red">❌ Error: ${error.message}</span>`;
  }
};

init();
