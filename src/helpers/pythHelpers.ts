import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';

export async function getPriceFeedsUpdateData(assets: string[]) {
  const connection = new EvmPriceServiceConnection('https://xc-testnet.pyth.network', {
    logger: console,
  });

  const priceIDs: string[] = [];
  for (let i = 0; i < assets.length; i++) {
    // const priceID = await aaveOracle.getSourceOfAsset(assets[i]);
    const priceID = '0x9b7bfd7654cbb80099d5edc0a29159afc9e9b4636c811cf8c3b95bd11dd8e3dd';
    priceIDs.push(priceID);
  }

  const updateData = await connection.getPriceFeedsUpdateData(priceIDs);

  return updateData;
}

export async function getLatestPriceFeeds(assets: string[]) {
  const connection = new EvmPriceServiceConnection('https://xc-testnet.pyth.network', {
    logger: console,
  });

  const priceIDs: string[] = [];
  for (let i = 0; i < assets.length; i++) {
    // const priceID = await aaveOracle.getSourceOfAsset(assets[i]);
    const priceID = '0x9b7bfd7654cbb80099d5edc0a29159afc9e9b4636c811cf8c3b95bd11dd8e3dd';
    priceIDs.push(priceID);
  }

  const latestPriceFeeds = await connection.getLatestPriceFeeds(priceIDs);

  return latestPriceFeeds;
}
