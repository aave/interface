import AaveOracleInterface from '@anirudhtx/aave-core-v3/artifacts/contracts/misc/AaveOracle.sol/AaveOracle.json';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import MockPythInterfaceAbi from '@pythnetwork/pyth-sdk-solidity/abis/MockPyth.json';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

export const usingMockPyth = true;

const assetToPriceFeedID = {
  // the two below are for FTM/wFTM
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee':
    '0x9b7bfd7654cbb80099d5edc0a29159afc9e9b4636c811cf8c3b95bd11dd8e3dd',
  '0x85074a24f943079c78C2fc1810Fc66b087D70e0a':
    '0x9b7bfd7654cbb80099d5edc0a29159afc9e9b4636c811cf8c3b95bd11dd8e3dd',

  '0x8DCc806EDb116A2173FdbCf59f7Cc4A5AF5487A1':
    '0x87a67534df591d2dd5ec577ab3c75668a8e3d35e92e27bf29d9e2e52df8de412',
  '0xc16ED3B88ef3Da09BB40aE8F3E354b4425a852e4':
    '0x83be4ed61dd8a3518d198098ce37240c494710a7b9d85e35d9fceac21df08994',
  '0x2b6b1F1D2bBC50836f95fC81920061849Fc75789':
    '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
  '0x35BD0e1f47A0D233fe8111f430481888554e5a69':
    '0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b',
  '0xd11DB38bA429F074076AcB6619016dc8F23b52ae':
    '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
  '0xf6819A955736A6C31609bcDFB98A6222fb26e988':
    '0x1fc18861232290221461220bd4e2acd1dcdfbc89c84092c93c18bdc7756c1588',
  '0x7a964B0Af56445e673A0752De7fE44EB8C35c14c':
    '0xd6b3bc030a8bbb7dd9de46fb564c34bb7f860dead8985eb16a49cdc62f8ab3a5',
  '0xfBF992630e2549fD9F5365E0a5EB3f93b7FD0bc3':
    '0x94bce4aee88fdfa5b58d81090bd6b3784717fa6df85419d9f04433bb3d615d5c',
  // below is SUSHI mock address : priceID for SHIB (Pyth currently doesn't support SUSHI)
  '0x70a7debb64dA2FB4D00e564B0f60088C4cAf2456':
    '0x672fbb7d9ec665cfbe8c2ffa643ba321a047b7a72d7b6d7c3d8fb120fc40954b',
};

// add lower case versions
for (const key in assetToPriceFeedID) {
  const keyLower = key.toLowerCase();
  assetToPriceFeedID[keyLower as keyof typeof assetToPriceFeedID] =
    assetToPriceFeedID[key as keyof typeof assetToPriceFeedID];
}

// set up aave oracle
const web3 = new Web3(Web3.givenProvider);
const aaveOracle = new web3.eth.Contract(
  AaveOracleInterface.abi as AbiItem[],
  '0x5bC41C962c0a7fC37Bb0d28B020957BE364A3B4B'
);

export async function getPythInfo(assets: string[], mockUpdateData: boolean) {
  const connection = new EvmPriceServiceConnection('https://xc-testnet.pyth.network', {
    logger: console,
  });

  const priceIDs: string[] = [];
  for (let i = 0; i < assets.length; i++) {
    const priceID = assetToPriceFeedID[assets[i] as keyof typeof assetToPriceFeedID];
    priceIDs.push(priceID);
  }

  const latestPriceFeeds = await connection.getLatestPriceFeeds(priceIDs);
  let updateData: string[] = [];
  if (mockUpdateData) {
    for (let i = 0; i < priceIDs.length; i++) {
      updateData.push(
        await generateMockPythUpdateData(
          priceIDs[i],
          latestPriceFeeds![i]['price']['price'],
          latestPriceFeeds![i]['price']['conf'],
          latestPriceFeeds![i]['price']['expo'],
          latestPriceFeeds![i]['emaPrice']['price'],
          latestPriceFeeds![i]['emaPrice']['conf'],
          latestPriceFeeds![i]['price']['publishTime']
        )
      );
    }
  } else {
    updateData = await connection.getPriceFeedsUpdateData(priceIDs);
  }

  return {
    priceIDs: priceIDs,
    prices: latestPriceFeeds,
    updateData: updateData,
  };
}

export async function updatePythPriceTx(updateData: string[]): Promise<void> {
  const accounts = await web3.eth.getAccounts();

  return aaveOracle.methods.updatePythPrice(updateData).send({
    value: 100,
    from: accounts[0],
  });
}

export async function generateMockPythUpdateData(
  id: string,
  price: number,
  conf: number,
  expo: number,
  emaPrice: number,
  emaConf: number,
  publishTime: number
) {
  // set up aave oracle
  const web3 = new Web3(Web3.givenProvider);
  const mockPyth = new web3.eth.Contract(
    MockPythInterfaceAbi as AbiItem[],
    '0x3deca2b10574857ed16a70013e56f0959f8e92db'
  );

  const updateData = await mockPyth.methods
    .createPriceFeedUpdateData(id, price, conf, expo, emaPrice, emaConf, publishTime)
    .call();

  return updateData;
}
