// public/main.js - VERSIÓN CORREGIDA (fecha en formato correcto)
console.log("🚀 Formulario de certificados listo");

const CONTRACT_ADDRESS = "0x0196fb4ac891F47CC194AB5D6b0419C8e709085f";
const SONIC_CHAIN_ID = 14601;

// ABI con 5 parámetros (string, string, string, uint256, string)
const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "guardarCertificado",
    "inputs": [
      { "name": "nombre", "type": "string" },
      { "name": "curso", "type": "string" },
      { "name": "nota", "type": "string" },
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

// Función para convertir fecha a timestamp CORRECTO (13 dígitos)
function convertirFechaATimestamp(fechaStr) {
  // El input type="date" devuelve YYYY-MM-DD
  // Ejemplo: "2026-04-01"
  
  if (!fechaStr) return 0;
  
  // Dividir la fecha
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return 0;
  
  const anio = parseInt(partes[0]);
  const mes = parseInt(partes[1]) - 1; // Los meses en JS van de 0 a 11
  const dia = parseInt(partes[2]);
  
  // Crear fecha en UTC para evitar problemas de zona horaria
  const fechaUTC = new Date(Date.UTC(anio, mes, dia, 0, 0, 0));
  const timestamp = fechaUTC.getTime();
  
  console.log("📅 Fecha original:", fechaStr);
  console.log("📅 Timestamp generado:", timestamp);
  console.log("📅 Fecha convertida:", new Date(timestamp).toISOString().split('T')[0]);
  
  return timestamp;
}

document.getElementById("cert-form").onsubmit = async (event) => {
  event.preventDefault();
  
  const nombre = document.getElementById("nombre").value;
  const curso = document.getElementById("curso").value;
  const nota = document.getElementById("nota").value;
  const fechaRaw = document.getElementById("fecha").value;
  const cid = document.getElementById("cid").value;
  
  const resultado = document.getElementById("resultado");
  
  if (!nombre || !curso || !nota || !fechaRaw || !cid) {
    resultado.innerHTML = '<span style="color:red">❌ Completa todos los campos</span>';
    return;
  }
  
  // CONVERTIR FECHA CORRECTAMENTE
  const fecha = convertirFechaATimestamp(fechaRaw);
  
  if (fecha === 0) {
    resultado.innerHTML = '<span style="color:red">❌ Fecha inválida</span>';
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
    
    // Enviar transacción con fecha CORRECTA
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
    
    // Convertir timestamp a fecha legible para mostrar
    const fechaLegible = new Date(fecha).toLocaleDateString('es-ES');
    
    resultado.innerHTML = `
      <div style="background:#e8f5e9; padding:15px; border-radius:10px; margin-top:15px;">
        🎉 CERTIFICADO REGISTRADO EN BLOCKCHAIN!<br><br>
        👤 ${nombre}<br>
        📚 ${curso}<br>
        ⭐ ${nota}<br>
        📅 ${fechaLegible}<br>
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
