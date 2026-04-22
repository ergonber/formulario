// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Formulario {
    struct Certificado {
        string nombre;
        string curso;
        uint8 nota;
        uint256 fecha;
        string cid;  // NUEVO CAMPO
    }

    Certificado[] public certificados;

    event CertificadoGuardado(string nombre, string curso, uint8 nota, uint256 fecha, string cid);

    // FUNCIÓN CON 5 PARÁMETROS
    function guardarCertificado(
        string memory nombre, 
        string memory curso, 
        uint8 nota, 
        uint256 fecha,
        string memory cid
    ) external {
        certificados.push(Certificado(nombre, curso, nota, fecha, cid));
        emit CertificadoGuardado(nombre, curso, nota, fecha, cid);
    }

    function obtenerCertificado(uint indice) public view returns (
        string memory, 
        string memory, 
        uint8, 
        uint256,
        string memory
    ) {
        Certificado memory cert = certificados[indice];
        return (cert.nombre, cert.curso, cert.nota, cert.fecha, cert.cid);
    }

    function totalCertificados() public view returns (uint) {
        return certificados.length;
    }
}
