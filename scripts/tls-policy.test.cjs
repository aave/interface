const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const policy = path.join(__dirname, 'tls-policy.cjs');
const fixtures = path.join(__dirname, 'fixtures/blocked-roots.pem');

function run(source, env = {}) {
  const result = spawnSync(process.execPath, ['-e', source], {
    encoding: 'utf8',
    env: { ...process.env, NODE_OPTIONS: '', ...env },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

test('removes both blocked keys from extra roots and preserves every other default root', () => {
  run(
    `
    const assert = require('node:assert/strict');
    const { X509Certificate, createHash } = require('node:crypto');
    const tls = require('node:tls');
    const key = pem => createHash('sha256').update(
      new X509Certificate(pem).publicKey.export({ type: 'spki', format: 'der' })
    ).digest('hex');
    const blocked = new Set([
      'bd153ed7b0434f6886b17bce8bbe84ed340c7132d702a8f4fa318f756ecbd6f3',
      '8d417db2dd8bf5e3084d1e3f196d583849d81bdd4c00c70b9d39369e96b8c782',
    ]);
    const before = tls.getCACertificates('default');
    assert.equal(new Set(before.map(key).filter(k => blocked.has(k))).size, 2);
    const expected = new Set(before.filter(pem => !blocked.has(key(pem))).map(pem => new X509Certificate(pem).fingerprint256));
    require(${JSON.stringify(policy)});
    const after = tls.getCACertificates('default');
    assert.deepEqual(new Set(after.map(pem => new X509Certificate(pem).fingerprint256)), expected);
    assert(after.some(pem => new X509Certificate(pem).subject.includes('Amazon Root CA')));
  `,
    { NODE_EXTRA_CA_CERTS: fixtures }
  );
});

test('preload also runs in Node workers', () => {
  run(
    `
    const { Worker } = require('node:worker_threads');
    const assert = require('node:assert/strict');
    const worker = new Worker(\`
      const { parentPort } = require('node:worker_threads');
      const { X509Certificate } = require('node:crypto');
      const tls = require('node:tls');
      parentPort.postMessage(tls.getCACertificates('default').map(pem => new X509Certificate(pem).subject));
    \`, { eval: true });
    worker.once('message', subjects => {
      assert(!subjects.some(s => s.includes('AAA Certificate Services') || s.includes('emSign ECC Root CA - G3')));
    });
    worker.once('error', error => { throw error; });
  `,
    { NODE_EXTRA_CA_CERTS: fixtures, NODE_OPTIONS: `--require ${JSON.stringify(policy)}` }
  );
});

test('fails closed when the runtime cannot replace default roots', () => {
  run(`
    require('node:tls').setDefaultCACertificates = undefined;
    require('node:assert/strict').throws(() => require(${JSON.stringify(
      policy
    )}), /TLS policy requires/);
  `);
});
