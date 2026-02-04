import { ethers } from "./web3modal.js";

const contractAddress = "<CONTRATO_ADDRESS>"; // Cambia luego
const contractABI = [
  "function guardarCertificado(string,string,uint8,uint256)",
];

const provider = new ethers.BrowserProvider(window.ethereum);
const form = document.getElementById("cert-form");
const resultado = document.getElementById("resultado");

form.onsubmit = async (event) => {
  event.preventDefault();
  if (!window.ethereum) {
    resultado.textContent = "MetaMask no detectado";
    return;
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const signer = await provider.getSigner();
  const contrato = new ethers.Contract(contractAddress, contractABI, signer);

  const nombre = document.getElementById("nombre").value;
  const curso = document.getElementById("curso").value;
  const nota = Number(document.getElementById("nota").value);
  const fecha = new Date(document.getElementById("fecha").value).getTime();
  try {
    const tx = await contrato.guardarCertificado(nombre, curso, nota, fecha);
    await tx.wait();
    resultado.textContent = "Certificado enviado exitosamente.";
  } catch (e) {
    resultado.textContent = "Error: " + e.message;
  }
};
