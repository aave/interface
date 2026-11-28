import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Emitter } from '@wagmi/core/internal';
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected, safe, walletConnect } from 'wagmi/connectors';

import { withOathWallet } from '../src/ui-config/oathWallet.ts';

const context = { chains: [mainnet], emitter: new Emitter('oath-test') };
const wc = walletConnect({ projectId: '0'.repeat(32), showQrModal: false });
const browserWallet = injected();
const safeWallet = safe({ allowedDomains: [/app.safe.global$/] });
const ids = (connectors) => connectors.map((connector) => connector(context).id);

test('Oath appears directly beside the canonical WalletConnect connector', async () => {
  const input = [browserWallet, wc, safeWallet];
  const output = withOathWallet(input, context);
  assert.deepEqual(ids(output), ['injected', 'oath', 'walletConnect', 'safe']);
  assert.deepEqual(input, [browserWallet, wc, safeWallet]);
  assert.equal(output[2], wc);
  assert.equal(output[3], safeWallet);

  const config = createConfig({
    chains: [mainnet],
    // Instantiate only the native entry; do not initialize a relay in host tests.
    connectors: [output[1]],
    transports: { [mainnet.id]: http() },
    ssr: true,
  });
  const oath = config.connectors.find((connector) => connector.id === 'oath');
  assert.equal(oath.name, 'Oath Wallet');
  assert.equal(await oath.getProvider(), undefined);
  assert.equal(await oath.isAuthorized(), false);
  assert.equal(ids(output).filter((id) => id === 'walletConnect').length, 1);
});

test('a configuration without WalletConnect does not advertise an unusable Oath entry', () => {
  assert.deepEqual(withOathWallet([browserWallet], context), [browserWallet]);
  assert.deepEqual(withOathWallet([], context), []);
  assert.equal(withOathWallet(undefined, context), undefined);
});

test('reapplying configuration does not duplicate Oath', () => {
  const once = withOathWallet([wc], context);
  assert.deepEqual(ids(withOathWallet(once, context)), ['oath', 'walletConnect']);
});
