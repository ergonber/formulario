// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Formulario {
    struct Certificado {
        string nombre;
        string curso;
        uint8 nota;
        uint256 fecha;
    }

    Certificado[] public certificados;

    event CertificadoGuardado(string nombre, string curso, uint8 nota, uint256 fecha);

    function guardarCertificado(string memory nombre, string memory curso, uint8 nota, uint256 fecha) external {
        certificados.push(Certificado(nombre, curso, nota, fecha));
        emit CertificadoGuardado(nombre, curso, nota, fecha);
    }

    function obtenerCertificado(uint indice) public view returns (string memory, string memory, uint8, uint256) {
        Certificado memory cert = certificados[indice];
        return (cert.nombre, cert.curso, cert.nota, cert.fecha);
    }

    function totalCertificados() public view returns (uint) {
        return certificados.length;
    }
}
