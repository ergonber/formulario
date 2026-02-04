import { ethers } from "./web3modal.js";

const contractAddress = "0x7BA96B6463bA70b4c5187a3606f583c101E83a16"; // Cambia luego
const contractABI = [
  {
    "type": "function",
    "name": "certificados",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "nombre",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "curso",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "nota",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "fecha",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "guardarCertificado",
    "inputs": [
      {
        "name": "nombre",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "curso",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "nota",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "fecha",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "obtenerCertificado",
    "inputs": [
      {
        "name": "indice",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalCertificados",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "CertificadoGuardado",
    "inputs": [
      {
        "name": "nombre",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "curso",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "nota",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "fecha",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
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
