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

    // Once we've seen errors on all providers, start the timer.
    // We should see another error after the rotation delay time.
    if (errors.length === badUrls.length) {
      start = Date.now();
    }
  });

  // We don't care about the result, we just need to fire off a request
  rotationProvider.getBlock(15741825);
});

fit('rotates back to first provider after delay', (done) => {
  const badUrl = 'http://some-fake-url-1';
  const mainnetProvider = getNetworkConfig(ChainId.mainnet);
  const rotationProvider = new RotationProvider(
    [badUrl, mainnetProvider.publicJsonRPCUrl[0], 'http://some-fake-url-2'],
    ChainId.mainnet,
    { fallFowardDelay: 5000 }
  );

  let errorCount = 0;
  let start: number;
  let firstErrorHandled = false;
  rotationProvider.on(
    'debug',
    (error: { action: string; provider: StaticJsonRpcProvider; error: any }) => {
      errorCount++;
      const url = error.provider.connection.url;
      expect(url).toBe('http://some-fake-url-1');
      if (!firstErrorHandled) {
        firstErrorHandled = true;
        start = Date.now();

        // Fire off another request after a delay, it shouldn't fail because
        // we've rotated to the second provider, which is the mainnet provider.
        setTimeout(() => {
          rotationProvider.getBlock(15741825);
        }, 1000);

        // Wait for the fall forward delay to expire, then fire off another request.
        // This should fail because we've rotated back to the first provider
        setTimeout(() => {
          rotationProvider.getBlock(15741825);
        }, 5500);
      } else {
        expect(Date.now() - start).toBeGreaterThan(5000);
        expect(errorCount).toBe(2);
        done();
      }
    }
  );

  // We don't care about the result, we just need to kick off a request
  rotationProvider.getBlock(15741825);
}, 6000);
