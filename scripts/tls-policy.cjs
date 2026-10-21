const { createHash, X509Certificate } = require('node:crypto');
const tls = require('node:tls');

// SHA-256 SPKI keys removed after the October 2026 eMudhra incident.
const blockedKeys = new Set([
  'bd153ed7b0434f6886b17bce8bbe84ed340c7132d702a8f4fa318f756ecbd6f3', // AAA Certificate Services
  '8d417db2dd8bf5e3084d1e3f196d583849d81bdd4c00c70b9d39369e96b8c782', // emSign ECC Root CA - G3
]);

if (typeof tls.setDefaultCACertificates !== 'function') {
  throw new Error('TLS policy requires Node 22.19+ or 24.5+');
}

const certificates = tls.getCACertificates('default').filter((pem) => {
  const publicKey = new X509Certificate(pem).publicKey.export({
    type: 'spki',
    format: 'der',
  });
  return !blockedKeys.has(createHash('sha256').update(publicKey).digest('hex'));
});

if (certificates.length === 0) {
  throw new Error('TLS policy found no trusted certificates');
}

// Replace defaults, including configured system/extra roots, before clients start.
tls.setDefaultCACertificates(certificates);
