// main.js - FORMULARIO DE REGISTRO CORREGIDO
const contractAddress = "0x7BA96B6463bA70b4c5187a3606f583c101E83a16";
const contractABI = [
  {
    "type": "function",
    "name": "guardarCertificado",
    "inputs": [
      { "name": "nombre", "type": "string", "internalType": "string" },
      { "name": "curso", "type": "string", "internalType": "string" },
      { "name": "nota", "type": "uint8", "internalType": "uint8" },
      { "name": "fecha", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

// Esperar a que cargue ethers
let provider;

async function initProvider() {
  if (typeof ethers === 'undefined') {
    console.log("⏳ Esperando ethers...");
    setTimeout(initProvider, 500);
    return;
  }
  
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    console.log("✅ Provider listo");
  } else {
    console.log("❌ MetaMask no detectado");
  }
}

initProvider();

const form = document.getElementById("cert-form");
const resultado = document.getElementById("resultado");

form.onsubmit = async (event) => {
  event.preventDefault();
  resultado.innerHTML = '<span style="color:#185a9d">🔍 Conectando wallet...</span>';
  
  try {
    if (!window.ethereum) {
      resultado.innerHTML = '<span style="color:red">❌ MetaMask no detectado</span>';
      return;
    }
    
    // Conectar MetaMask
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const address = accounts[0];
    console.log("👤 Conectado:", address);
    
    // Verificar red Sonic Testnet (chainId 14601 = 0x3909)
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (parseInt(chainId, 16) !== 14601) {
      resultado.innerHTML = '<span style="color:orange">🔄 Cambiando a Sonic Testnet...</span>';
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x3909" }]
        });
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
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Obtener signer y contrato
    const signer = await provider.getSigner();
    const contrato = new ethers.Contract(contractAddress, contractABI, signer);
    
    // Obtener valores del formulario
    const nombre = document.getElementById("nombre").value;
    const curso = document.getElementById("curso").value;
    const notaRaw = document.getElementById("nota").value;
    const fechaRaw = document.getElementById("fecha").value;
    const cid = document.getElementById("cid").value;  // CID del PDF
    
    // Validar campos
    if (!nombre || !curso || !notaRaw || !fechaRaw || !cid) {
      resultado.innerHTML = '<span style="color:red">❌ Completa todos los campos</span>';
      return;
    }
    
    // Convertir nota a número (uint8: 0-255)
    let notaNum = parseInt(notaRaw);
    if (isNaN(notaNum)) notaNum = 0;
    if (notaNum < 0) notaNum = 0;
    if (notaNum > 255) notaNum = 255;
    
    // Convertir fecha a timestamp (uint256)
    const fechaTimestamp = new Date(fechaRaw).getTime();
    
    console.log("📤 Enviando transacción:", { nombre, curso, notaNum, fechaTimestamp });
    resultado.innerHTML = '<span style="color:#185a9d">⏳ Enviando a blockchain...</span>';
    
    // Enviar transacción
    const tx = await contrato.guardarCertificado(nombre, curso, notaNum, fechaTimestamp);
    
    console.log("✅ Transacción enviada:", tx.hash);
    resultado.innerHTML = `<span style="color:#090">✅ Transacción enviada!<br>Hash: ${tx.hash.slice(0, 20)}...</span>`;
    
    // Esperar confirmación
    resultado.innerHTML = '<span style="color:#185a9d">⏳ Esperando confirmación...</span>';
    const receipt = await tx.wait();
    
    console.log("✅ Confirmada en bloque:", receipt.blockNumber);
    
    // Guardar el CID en localStorage o mostrarlo
    const verificationUrl = `https://verificador-xi.vercel.app/?hash=${tx.hash}`;
    
    // Generar QR
    generarQR(verificationUrl);
    
    // Mostrar resultado final con el CID
    resultado.innerHTML = `
      <span style="color:#090">🎉 CERTIFICADO REGISTRADO!</span><br>
      <span style="font-size:12px">Hash: ${tx.hash}</span><br>
      <span style="font-size:12px">Block: ${receipt.blockNumber}</span><br>
      <span style="font-size:12px">CID: ${cid}</span><br>
      <a href="${verificationUrl}" target="_blank" style="color:#185a9d">🔗 Ver certificado</a>
    `;
    
    // Limpiar formulario (opcional)
    // document.getElementById("cert-form").reset();
    
  } catch (error) {
    console.error("❌ Error:", error);
    resultado.innerHTML = `<span style="color:red">❌ Error: ${error.message || error}</span>`;
  }
};

// Función para generar QR
function generarQR(data) {
  const qrSection = document.getElementById("qr-section");
  if (!qrSection) return;
  
  qrSection.innerHTML = '<h3 style="color:#185a9d; margin-top:20px">📱 Código QR del certificado</h3>';
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  
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
  
  const qrLink = document.createElement("a");
  qrLink.href = qrUrl;
  qrLink.download = "certificado-qr.png";
  qrLink.textContent = "💾 Descargar QR";
  qrLink.style.display = "block";
  qrLink.style.marginTop = "10px";
  qrLink.style.color = "#185a9d";
  qrLink.style.fontWeight = "bold";
  qrLink.style.textDecoration = "none";
  
  qrSection.appendChild(qrLink);
  
  const infoText = document.createElement("p");
  infoText.style.fontSize = "12px";
  infoText.style.color = "#666";
  infoText.style.marginTop = "10px";
  infoText.innerHTML = `🔗 Escanea para verificar: ${data.slice(0, 50)}...`;
  qrSection.appendChild(infoText);
}
