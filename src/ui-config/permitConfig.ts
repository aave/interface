import { ChainId } from '@aave/contract-helpers';

export const permitByChainAndToken: {
  [chainId: number]: Record<string, boolean>;
} = {
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
};
