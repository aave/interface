import { ChainId } from '@aave/contract-helpers';

export const permitByChainAndToken: {
  [chainId: number]: Record<string, boolean>;
} = {
  59144: {
    '0x7d43aabc515c356145049227cee54b608342c0ad': false,
    '0x176211869ca2b568f2a7d4ee941e073a821ee1ff': false,
    '0xa219439258ca9da29e9cc4ce5596924745e12b93': false,
  },
  [ChainId.mainnet]: {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': false,
    '0x6b175474e89094c44da98b954eedeac495271d0f': false,
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': true, // wsteth
    '0x514910771af9ca656af840dff83e8264ecf986ca': false,
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': false,
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': false,
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': true, // aave
    '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f': true, // gho
    '0x5f98805a4e8be255a32880fdec7f6728c6568ba0': true, // lusd
  },
  [ChainId.arbitrum_one]: {
    '0xf97f4df75117a78c1a5a0dbb814af92458539fb4': true,
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': true,
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': true,
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': true,
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': true,
    '0xba5ddd1f9d7f570dc94a51479a000e3bce967196': true,
    '0xd22a58f79e9481d1a88e00c343885a588b34b68b': false, // eurs
  },
  [ChainId.fantom]: {
    '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e': true,
    '0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8': true,
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75': true,
    '0x321162cd933e2be498cd2267a90534a804051b11': true,
    '0x74b23882a30290451a17c44f4f05243b6b58c76d': true,
    '0x049d68029688eabf473097a2fc38ef61633a3c7a': true,
    '0x6a07a792ab2965c72a5b8088d3a069a7ac3a993b': true,
    '0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc': false, // sushi
    '0x1e4f97b9f9f913c46f1632781732927b9019c68b': true,
  },
  [ChainId.polygon]: {
    '0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c': true,
  },
  [ChainId.harmony]: {},
  [ChainId.avalanche]: {
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': true,
  },
  [ChainId.optimism]: {
    '0x76fb31fb4af56892a25e32cfc43de717950c9278': false, // aave
  },
};
