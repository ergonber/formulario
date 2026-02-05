const contractAddress = "0x7BA96B6463bA70b4c5187a3606f583c101E83a16";
const contractABI = [
  // ...igual que antes, tu ABI aquí...
];

const provider = new ethers.BrowserProvider(window.ethereum);
const form = document.getElementById("cert-form");
const resultado = document.getElementById("resultado");
const qrSection = document.getElementById("qr-section");

form.onsubmit = async (event) => {
  event.preventDefault();
  qrSection.innerHTML = "";
  resultado.textContent = "";
  try {
    if (!window.ethereum) {
      resultado.textContent = "MetaMask no detectado";
      return;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = await provider.getSigner();
    const contrato = new ethers.Contract(contractAddress, contractABI, signer);
    const nombre = document.getElementById("nombre").value;
    const curso = document.getElementById("curso").value;
    const nota = document.getElementById("nota").value;
    const fecha = new Date(document.getElementById("fecha").value).getTime();
    const cid = document.getElementById("cid").value;
    // Ajusta esto si cambias el smart contract para incluir CID (ahora no lo guarda en bloque, pero lo usa en el QR)
    const tx = await contrato.guardarCertificado(nombre, curso, isNaN(Number(nota)) ? 0 : Number(nota), fecha);
    const receipt = await tx.wait();
    resultado.textContent = "Certificado enviado exitosamente.";
    // Usamos el hash de la transacción + el address + el CID en la url QR
    const qrUrl = `https://formulario-self-two.vercel.app/?tx=${tx.hash}&addr=${contractAddress}&cid=${cid}`;
    generarQR(qrUrl);
  } catch (e) {
    resultado.textContent = "Error: " + (e?.message || e);
  }
};

function generarQR(text) {
  qrSection.innerHTML = `<div style='margin-bottom:7px;'>QR de verificación</div>`;
  const qr = document.createElement("img");
  qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(text)}`;
  qr.alt = "QR Certificado Blockchain";
  qrSection.appendChild(qr);
  qrSection.innerHTML += `<div style='font-size:0.92em;color:#185a9d;margin-top:8px;word-break:break-all;'>${text}</div>`;
}
