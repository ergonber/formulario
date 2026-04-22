// public/main.js - CON 5 PARÁMETROS Y NUEVA DIRECCIÓN
console.log("🚀 Formulario de certificados listo");

// ⚠️ REEMPLAZA CON LA NUEVA DIRECCIÓN DE TU CONTRATO DESPLEGADO
const CONTRACT_ADDRESS = "0x2aac72f1eFFd847C9b2E900de8fFb57be4a18e24";
const SONIC_CHAIN_ID = 14601;

// ABI con 5 parámetros (incluye CID)
const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "guardarCertificado",
    "inputs": [
      { "name": "nombre", "type": "string" },
      { "name": "curso", "type": "string" },
      { "name": "nota", "type": "uint8" },
      { "name": "fecha", "type": "uint256" },
      { "name": "cid", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

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
      resultado.innerHTML = '<span style="color:orange">🔄 Cambiando a Sonic Testnet...</span>';
      await switchToSonic();
      await new Promise(r => setTimeout(r, 2000));
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    resultado.innerHTML = '<span style="color:#185a9d">⏳ Enviando transacción...</span>';
    
    // 5 PARÁMETROS (CON CID)
    const tx = await contract.guardarCertificado(nombre, curso, nota, fecha, cid);
    
    resultado.innerHTML = `<span style="color:#090">✅ Transacción enviada!<br>Hash: ${tx.hash.slice(0, 20)}...</span>`;
    
    const receipt = await tx.wait();
    
    const verificationUrl = `https://verificador-xi.vercel.app/?hash=${tx.hash}`;
    
    const qrSection = document.getElementById("qr-section");
    qrSection.innerHTML = `
      <h3 style="margin-top:20px">📱 Código QR</h3>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verificationUrl)}" style="border:2px solid #185a9d; border-radius:10px; padding:10px; background:white;">
      <a href="${verificationUrl}" target="_blank" style="color:#185a9d;">🔗 Ver certificado</a>
    `;
    
    resultado.innerHTML = `
      <div style="background:#e8f5e9; padding:15px; border-radius:10px; margin-top:15px;">
        🎉 CERTIFICADO REGISTRADO EN BLOCKCHAIN!<br><br>
        👤 ${nombre}<br>
        📚 ${curso}<br>
        ⭐ ${nota}<br>
        📅 ${new Date(fecha).toLocaleDateString()}<br>
        🔗 CID: ${cid}<br>
        📫 Hash: ${tx.hash}<br>
        🔢 Block: ${receipt.blockNumber}<br>
        <a href="https://testnet.soniclabs.com/tx/${tx.hash}" target="_blank">🔍 Ver en Explorer</a>
      </div>
    `;
    
    document.getElementById("cert-form").reset();
    
  } catch (error) {
    console.error(error);
    resultado.innerHTML = `<span style="color:red">❌ Error: ${error.message || error}</span>`;
  }
};
