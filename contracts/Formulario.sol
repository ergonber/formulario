// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Formulario {
    struct Certificado {
        string nombre;
        string curso;
        uint8 nota;
        uint256 fecha;
        string cid;  // NUEVO: Campo para el CID
    }

    Certificado[] public certificados;

    event CertificadoGuardado(string nombre, string curso, uint8 nota, uint256 fecha, string cid);

    // FUNCIÓN ACTUALIZADA CON 5 PARÁMETROS (incluye CID)
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

    // OBTENER CERTIFICADO COMPLETO (incluye CID)
    function obtenerCertificado(uint indice) public view returns (
        string memory, 
        string memory, 
        uint8, 
        uint256,
        string memory  // NUEVO: retorna el CID
    ) {
        Certificado memory cert = certificados[indice];
        return (cert.nombre, cert.curso, cert.nota, cert.fecha, cert.cid);
    }

    function totalCertificados() public view returns (uint) {
        return certificados.length;
    }
}
