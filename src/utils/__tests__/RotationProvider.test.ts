import { ChainId } from '@aave/contract-helpers';
import { StaticJsonRpcProvider } from '@ethersproject/providers/src.ts';

import { getNetworkConfig, RotationProvider } from '../marketsAndNetworksConfig';

it('rotates through providers on error', async () => {
  const badUrls = ['http://some-fake-url-1', 'http://some-fake-url-2'];
  const mainnetProvider = getNetworkConfig(ChainId.mainnet);
  const rotationProvider = new RotationProvider(
    [...badUrls, mainnetProvider.publicJsonRPCUrl[0]],
    ChainId.mainnet
  );

  const errors: string[] = [];
  rotationProvider.on('debug', (error: { action: string; provider: StaticJsonRpcProvider }) => {
    errors.push(error.provider.connection.url);
  });

  const result = await rotationProvider.getBlock(15741825);

  // This is the gas used for block number 15741825 on mainnet
  expect(result.gasUsed.toString()).toBe('17654373');
  expect(errors).toEqual([...badUrls]);
});

it('waits for the rotation delay time after all providers have failed', (done) => {
  const badUrls = ['http://some-fake-url-1', 'http://some-fake-url-2', 'http://some-fake-url-3'];
  const rotationProvider = new RotationProvider(badUrls, ChainId.mainnet, { rotationDelay: 1000 });

  const errors: string[] = [];
  let start: number;
  rotationProvider.on('debug', (error: { action: string; provider: StaticJsonRpcProvider }) => {
    errors.push(error.provider.connection.url);
    if (start) {
      expect(Date.now() - start).toBeGreaterThan(1000);
      done();
    }

    // once we've seen errors on all providers, start the timer
    if (errors.length === badUrls.length) {
      start = Date.now();
    }
  });

  // We don't care about the result, we just need to kick off a request
  rotationProvider.getBlock(15741825);
});
