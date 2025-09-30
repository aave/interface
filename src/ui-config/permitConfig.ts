import { ChainId } from '@aave/contract-helpers';

/**
 * Maps token permit support by chain and token address.
 * Permit enables gasless approvals using signed messages (EIP-2612).
 *
 * To check if a token supports permit, check if the contract has a permit function in the chain's scanner
 * or in the contract's source code.
 *
 * @dev use addresses in lowercase
 */
export const permitByChainAndToken: {
  [chainId: number]: Record<string, boolean>;
} = {
  [ChainId.mainnet]: {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': false, // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f': false, // DAI
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': true, // AAVE
    '0x514910771af9ca656af840dff83e8264ecf986ca': false, // LINK
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': false, // WBTC
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': false, // WETH
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': true, // wstETH
    '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f': true, // GHO
    '0x5f98805a4e8be255a32880fdec7f6728c6568ba0': true, // LUSD
    '0xdc035d45d973e3ec169d2276ddab16f1e407384f': true, // USDS
    '0x14d60e7fdc0d71d8611742720e4c50e7a974020c': true, // USCC superstake underlying_tokenv
    '0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e': true, // USTB underlying_token (AaveV3Horizon)
    '0x5a0f93d040de44e78f251b03c43be9cf317dcf64': true, // JAAA underlying_token Janus Henderson Andmenum (Aave V3 Horizon)
    '0x8c213ee79581ff4984583c6a801e5263418c4b86': true, // JTSRY underlying_token Janus Henderson Andmenum (Aave V3 Horizon)
    '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b': true, // USYC underlying_token US Yield Coin (AaveV3Horizon)
  },
  [ChainId.arbitrum_one]: {
    '0xf97f4df75117a78c1a5a0dbb814af92458539fb4': true,
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': true,
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': true,
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': true,
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': true,
    '0xba5ddd1f9d7f570dc94a51479a000e3bce967196': true,
    '0x7dff72693f6a4149b17e7c6314655f6a9f7c8b33': true, // GHO
    '0xd22a58f79e9481d1a88e00c343885a588b34b68b': false, // eurs
  },

  [ChainId.polygon]: {
    '0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c': true,
  },
  [ChainId.avalanche]: {
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': true,
  },
  [ChainId.optimism]: {
    '0x76fb31fb4af56892a25e32cfc43de717950c9278': false, // aave
  },
  [ChainId.zksync]: {
    '0x5a7d6b2f92c77fad6ccabd7ee0624e64907eaf3e': true,
    '0x703b52f2b28febcb60e1372858af5b18849fe867': true,
    '0x493257fd37edb34451f62edf8d2a0c418852ba4c': true,
    '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91': true,
  },
  [ChainId.linea]: {
    '0xa219439258ca9da29e9cc4ce5596924745e12b93': true, // USDT
    '0x2416092f143378750bb29b79ed961ab195cceea5': true, // ezETH
    '0xb5bedd42000b71fdde22d3ee8a79bd49a568fc8f': true, // wstETH
  },
  [ChainId.sonic]: {
    // adding these in false for clarity
    '0x50c42deacd8fc9773493ed674b675be577f2634b': false, // WETH
    '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38': false, // wS
    '0x29219dd400f2bf60e5a23d13be72b486d4038894': false, // USDC.e
  },
  [ChainId.celo]: {
    // '0xceba9300f2b948710d2653dd7b07f33a8b32118c': true, // USDC
    '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e': true, // USDT
    // '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73': true, // cEUR
    // '0x765de816845861e75a25fca122bb6898b8b1282a': true, // cUSD
  },
};

export const rwaAssetDomains: { [key: string]: { name: string; version: string } } = {  
  '0x14d60e7fdc0d71d8611742720e4c50e7a974020c': { // USCC AaveV3Horizon
    name: 'Superstate Crypto Carry Fund',
    version: '5',
  },
  '0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e': { // USTB AaveV3Horizon
    name: 'Superstate Short Duration US Government Securities Fund',
    version: '5',
  },
  '0x5a0f93d040de44e78f251b03c43be9cf317dcf64': { // JAAA AaveV3Horizon
    name: 'Centrifuge',
    version: '1',
  },
  '0x8c213ee79581ff4984583c6a801e5263418c4b86': { // JTSRY AaveV3Horizon
    name: 'Centrifuge',
    version: '1',
  },
  '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b': { // USYC AaveV3Horizon
    name: 'US Yield Coin',
    version: '2',
  },
}
