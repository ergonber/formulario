const { ethers } = require("ethers");
const fs = require("fs");
const abi = JSON.parse(fs.readFileSync("../out/Formulario.sol/Formulario.json")).abi;
const bytecode = JSON.parse(fs.readFileSync("../out/Formulario.sol/Formulario.json")).bytecode.object;

// Edita estos datos con tu RPC y clave privada de Sonic Testnet
const RPC_URL = process.env.RPC_URL || "https://rpc.sonic.fusionist.io";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "<PRIVATE_KEY>";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contrato = await factory.deploy();
    await contrato.deploymentTransaction().wait();
    console.log("Contrato desplegado en:", contrato.target);
}

main().catch(console.error);
