// main.js - FORMULARIO DE REGISTRO COMPLETO CON CID EN BLOCKCHAIN
console.log("🚀 Iniciando formulario de certificados...");

// Configuración de Sonic Testnet
const CONTRACT_ADDRESS = "0x7BA96B6463bA70b4c5187a3606f583c101E83a16";
const SONIC_CHAIN_ID = 14601;
const SONIC_RPC_URL = "https://rpc.testnet.soniclabs.com";

// ABI del contrato (incluye evento para CID)
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
  },
  {
    "type": "event",
    "name": "CertificadoGuardado",
    "inputs": [
      { "name": "emisor", "type": "address", "indexed": true },
      { "name": "estudiante", "type": "string", "indexed": false },
      { "name": "curso", "type": "string", "indexed": false },
      { "name": "cid", "type": "string", "indexed": false },
      { "name": "fecha", "type": "uint256", "indexed": false }
    ]
  }
];

let provider;
let signer;
let contract;

// Inicializar provider
async function initProvider() {
  if (typeof ethers === 'undefined') {
    console.log("⏳ Esperando ethers...");
    setTimeout(initProvider, 500);
    return;
  }
  
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    console.log("✅ Provider listo");
    return true;
  } else {
    console.log("❌ MetaMask no detectado");
    document.getElementById('resultado').innerHTML = '<span style="color:red">❌ Instala MetaMask</span>';
    return false;
  }
}

// Cambiar a Sonic Testnet
async function switchToSonicNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x3909" }]
    });
    return true;
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x3909",
          chainName: "Sonic Testnet",
          nativeCurrency: { name: "Sonic", symbol: "S", decimals: 18 },
          rpcUrls: ["https://rpc.testnet.soniclabs.com"],
          blockExplorerUrls: ["https://testnet.soniclabs.com/"]
        }]
      });
      return true;
    }
    throw switchError;
  }
}

// Generar código QR
function generarQR(data, hash, cid) {
  const qrSection = document.getElementById("qr-section");
  if (!qrSection) return;
  
  qrSection.innerHTML = '<h3 style="color:#185a9d; margin-top:20px">📱 Código QR del certificado</h3>';
  
  // Link directo al verificador con el hash
  const verificationUrl = `https://verificador-xi.vercel.app/?hash=${hash}`;
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
  
  const qrImg = document.createElement("img");
  qrImg.src = qrUrl;
  qrImg.style.width = "200px";
  qrImg.style.height = "200px";
  qrImg.style.marginTop = "10px";
  qrImg.style.border = "2px solid #185a9d";
  qrImg.style.borderRadius = "10px";
  qrImg.style.padding = "10px";
  qrImg.style.background = "white";
  
  qrSection.appendChild(qrImg);
  
  // Botón descargar QR
  const qrLink = document.createElement("a");
  qrLink.href = qrUrl;
  qrLink.download = `certificado-${hash.slice(0, 10)}.png`;
  qrLink.textContent = "💾 Descargar QR";
  qrLink.style.display = "block";
  qrLink.style.marginTop = "10px";
  qrLink.style.color = "#185a9d";
  qrLink.style.fontWeight = "bold";
  qrLink.style.textDecoration = "none";
  qrSection.appendChild(qrLink);
  
  // Link al verificador
  const verifyLink = document.createElement("a");
  verifyLink.href = verificationUrl;
  verifyLink.target = "_blank";
  verifyLink.textContent = "🔗 Ver certificado online";
  verifyLink.style.display = "block";
  verifyLink.style.marginTop = "10px";
  verifyLink.style.color = "#43cea2";
  verifyLink.style.fontWeight = "bold";
  verifyLink.style.textDecoration = "none";
  qrSection.appendChild(verifyLink);
}

// Función principal para crear certificado
async function createCertificate(event) {
  event.preventDefault();
  
  const nombre = document.getElementById("nombre").value;
  const curso = document.getElementById("curso").value;
  const notaRaw = document.getElementById("nota").value;
  const fechaRaw = document.getElementById("fecha").value;
  const cid = document.getElementById("cid").value;
  
  if (!nombre || !curso || !notaRaw || !fechaRaw || !cid) {
    document.getElementById("resultado").innerHTML = '<span style="color:red">❌ Completa todos los campos</span>';
    return;
  }
  
  if (!window.ethereum) {
    document.getElementById("resultado").innerHTML = '<span style="color:red">❌ Instala MetaMask</span>';
    return;
  }
  
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = '<span style="color:#185a9d">🔍 Conectando wallet...</span>';
  
  try {
    // Conectar MetaMask
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const address = accounts[0];
    console.log("👤 Conectado:", address);
    
    // Verificar red Sonic Testnet
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (parseInt(chainId, 16) !== SONIC_CHAIN_ID) {
      resultadoDiv.innerHTML = '<span style="color:orange">🔄 Cambiando a Sonic Testnet...</span>';
      await switchToSonicNetwork();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Inicializar ethers
    if (!provider) await initProvider();
    
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    // Convertir nota a número (uint8: 0-255)
    let notaNum = parseInt(notaRaw);
    if (isNaN(notaNum)) notaNum = 0;
    if (notaNum < 0) notaNum = 0;
    if (notaNum > 255) notaNum = 255;
    
    // Convertir fecha a timestamp (milisegundos desde 1970)
    const fechaTimestamp = new Date(fechaRaw).getTime();
    
    console.log("📤 Enviando transacción:", { nombre, curso, notaNum, fechaTimestamp, cid });
    resultadoDiv.innerHTML = '<span style="color:#185a9d">⏳ Enviando a blockchain...</span>';
    
    // Enviar transacción con CID incluido
    const tx = await contract.guardarCertificado(nombre, curso, notaNum, fechaTimestamp, cid);
    
    console.log("✅ Transacción enviada:", tx.hash);
    resultadoDiv.innerHTML = `<span style="color:#090">✅ Transacción enviada!<br>Hash: ${tx.hash.slice(0, 20)}...</span>`;
    
    // Esperar confirmación
    resultadoDiv.innerHTML = '<span style="color:#185a9d">⏳ Esperando confirmación (1-2 minutos)...</span>';
    const receipt = await tx.wait();
    
    console.log("✅ Confirmada en bloque:", receipt.blockNumber);
    
    // Generar QR con el hash
    generarQR(tx.hash, tx.hash, cid);
    
    // Mostrar resultado final
    resultadoDiv.innerHTML = `
      <div style="background:#e8f5e9; padding:15px; border-radius:10px; margin-top:15px;">
        <span style="color:#2e7d32; font-size:1.2em;">🎉 CERTIFICADO REGISTRADO!</span><br>
        <strong>👤 Estudiante:</strong> ${nombre}<br>
        <strong>📚 Curso:</strong> ${curso}<br>
        <strong>⭐ Nota:</strong> ${notaRaw}<br>
        <strong>📅 Fecha:</strong> ${fechaRaw}<br>
        <strong>🔗 CID:</strong> <span style="font-size:11px; word-break:break-all;">${cid}</span><br>
        <strong>📫 Hash:</strong> <span style="font-size:11px; word-break:break-all;">${tx.hash}</span><br>
        <strong>🔢 Block:</strong> ${receipt.blockNumber}<br>
        <a href="https://testnet.soniclabs.com/tx/${tx.hash}" target="_blank" style="color:#185a9d">🔍 Ver en Sonic Explorer</a><br>
        <a href="https://verificador-xi.vercel.app/?hash=${tx.hash}" target="_blank" style="color:#43cea2">✅ Verificar certificado</a>
      </div>
    `;
    
    // Limpiar formulario (opcional)
    // document.getElementById("cert-form").reset();
    
  } catch (error) {
    console.error("❌ Error:", error);
    resultadoDiv.innerHTML = `<span style="color:red">❌ Error: ${error.message || error}</span>`;
  }
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
  initProvider();
  const form = document.getElementById("cert-form");
  if (form) {
    form.addEventListener("submit", createCertificate);
  }
  console.log("✅ Formulario listo");
});
