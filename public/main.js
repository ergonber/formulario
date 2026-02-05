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

const provider = new ethers.BrowserProvider(window.ethereum);
const form = document.getElementById("cert-form");
const resultado = document.getElementById("resultado");

form.onsubmit = async (event) => {
  event.preventDefault();
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
    const notaRaw = document.getElementById("nota").value;
    let notaNum = parseInt(notaRaw);
    if (isNaN(notaNum)) notaNum = 0;  // Se fuerza a uint8 porque así lo requiere el contrato
    const fecha = new Date(document.getElementById("fecha").value).getTime();
    const tx = await contrato.guardarCertificado(nombre, curso, notaNum, fecha);
    await tx.wait();
    resultado.innerHTML = `Certificado enviado exitosamente.<br>Tx Hash: <a href='https://sonic.fusionist.io/tx/${tx.hash}' target='_blank'>${tx.hash}</a><br>Address Contrato: <b>${contractAddress}</b>`;
  } catch (e) {
    resultado.textContent = "Error: " + (e?.message || e);
  }
};
