import { ChainId } from '@aave/contract-helpers';

export const permitByChainAndToken: {
  [chainId: number]: Record<string, boolean>;
} = {
  [ChainId.mainnet]: {},
  [ChainId.goerli]: {
    '0xdf1742fe5b0bfc12331d8eaec6b478dfdbd31464': true,
    '0xaa63e0c86b531e2edfe9f91f6436df20c301963d': true,
    '0xa2025b15a1757311bfd68cb14eaefcc237af5b43': true,
    '0xc2c527c0cacf457746bd31b2a698fe89de2b6d49': true,
    '0x63242b9bd3c22f18706d5c4e627b4735973f1f07': true,
    '0x07c725d58437504ca5f814ae406e70e21c5e8e9e': true,
    '0x8869dfd060c682675c2a8ae5b21f2cf738a0e3ce': true,
    '0x2e3a2fb8473316a02b8a297b982498e661e1f6f5': true,
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
  [ChainId.arbitrum_goerli]: {
    '0x805ac2a202e3e217b0c9fe53908ea5e36856fd29': true,
    '0x7e752bc77ebe2225b327e6ebf09fad7801873931': true,
    '0x569275a32682abd8de2ed68dc7443724a8ad8660': true,
    '0xd0fbc05a6b234b2a6a9d65389c2ffd93fef0527e': true,
    '0x6775842ae82bf2f0f987b10526768ad89d79536e': true,
    '0xbac565f93f3192d35e9106e67b9d5c9348bd9389': true,
    '0x2df743730160059c50c6ba9e87b30876fa6db720': true,
    '0xcda739d69067333974cd73a722ab92e5e0ad8a4f': true,
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
  [ChainId.fantom_testnet]: {
    '0x2a6202b83bd2562d7460f91e9298abc27a2f0a95': true,
    '0xac1a9503d1438b56baa99939d44555fc2dc286fc': true,
    '0xc469ff24046779de9b61be7b5df91dbffdf1ae02': true,
    '0x42dc50eb0d35a62eac61f4e4bc81875db9f9366e': true,
    '0x484b87aa284f51e71f15eba1aeb06dfd202d5511': true,
    '0x06f0790c687a1bed6186ce3624edd9806edf9f4e': true,
    '0x1b901d3c9d4ce153326beec60e0d4a2e8a9e3ce3': true,
    '0xd0404a349a76cd2a4b7ab322b9a6c993dbc3a7e7': true,
    '0x2af63215417f90bd45608115452d86d0a1beae5e': true,
    '0xf7475b635ebe06d9c5178cc40d50856fa98c7332': true,
  },
  [ChainId.polygon]: {
    '0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c': true,
  },
  [ChainId.mumbai]: {
    '0x0ab1917a0cf92cdcf7f7b637eac3a46bbbe41409': true,
    '0xfcadbdefd30e11258559ba239c8a5a8a8d28cb00': true,
    '0xe3981f4840843d67af50026d34da0f7e56a02d69': true,
    '0x3e4b51076d7e9b844b92f8c6377087f9cf8c8696': true,
    '0x9a753f0f7886c9fbf63cf59d0d4423c5eface95b': true,
    '0x56e0507a53ee252947a1e55d84dc4032f914dd98': true,
    '0x302567472401c7c7b50ee7eb3418c375d8e3f728': true,
    '0x8aaf462990dd5cc574c94c8266208996426a47e7': true,
    '0xbaacc99123133851ba2d6d34952aa08cbdf5a4e4': true,
    '0xd9e7e5dd6e122dde11244e14a60f38aba93097f2': true,
    '0xddc3c9b8614092e6188a86450c8d597509893e20': true,
    '0x9aa7fec87ca69695dd1f879567ccf49f3ba417e2': true,
    '0x21c561e551638401b937b03fe5a0a0652b99b7dd': true,
    '0x85e44420b6137bbc75a85cab5c9a3371af976fde': true,
    '0xd575d4047f8c667e064a4ad433d04e25187f40bb': true,
    '0xb685400156cf3cbe8725958deaa61436727a30c3': false, // wmatic dont have permit
  },
  [ChainId.harmony]: {},
  [ChainId.avalanche]: {
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': true,
  },
  [ChainId.fuji]: {
    '0x407287b03d1167593af113d32093942be13a535f': true,
    '0xfc7215c9498fc12b22bc0ed335871db4315f03d3': true,
    '0x73b4c0c45bfb90fc44d9013fa213ef2c2d908d0a': true,
    '0x3e937b4881cbd500d05eedab7ba203f2b7b3f74f': true,
    '0x09c85ef96e93f0ae892561052b48ae9db29f2458': true,
    '0x28a8e6e41f84e62284970e4bc0867cee2aad0da4': true,
    '0xd90db1ca5a6e9873bcd9b0279ae038272b656728': true,
    '0xccbbaf8d40a5c34bf1c836e8dd33c7b7646706c5': true,
  },
  [ChainId.optimism]: {
    '0x76fb31fb4af56892a25e32cfc43de717950c9278': false, // aave
  },
  [ChainId.optimism_goerli]: {
    ['0xdf1742fe5b0bfc12331d8eaec6b478dfdbd31464']: true,
    ['0xaa63e0c86b531e2edfe9f91f6436df20c301963d']: true,
    ['0xa2025b15a1757311bfd68cb14eaefcc237af5b43']: true,
    ['0xc2c527c0cacf457746bd31b2a698fe89de2b6d49']: true,
    ['0x63242b9bd3c22f18706d5c4e627b4735973f1f07']: true,
    ['0x07c725d58437504ca5f814ae406e70e21c5e8e9e']: true,
    ['0x2e3a2fb8473316a02b8a297b982498e661e1f6f5']: true,
  },
};
