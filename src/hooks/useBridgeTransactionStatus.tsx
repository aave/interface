import { ChainId } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import { BigNumberish, Contract } from 'ethers';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import routerAbi from '../components/transactions/Bridge/Router-abi.json';

// import { BridgeTransaction } from './useBridgeTransactionHistory';

type Config = {
  sourceChainId: ChainId;
  router: string;
  chainSelector: string;
  destinations: {
    destinationChainId: ChainId;
    onRamp: string;
  }[];
};

export const laneConfig: Config[] = [
  {
    sourceChainId: ChainId.sepolia,
    chainSelector: '16015286601757825753',
    router: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59'.toLowerCase(),
    destinations: [
      {
        destinationChainId: ChainId.arbitrum_sepolia,
        onRamp: '0xe4Dd3B16E09c016402585a8aDFdB4A18f772a07e'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.fuji,
        onRamp: '0x0477cA0a35eE05D3f9f424d88bC0977ceCf339D4'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.base_sepolia,
        onRamp: '0x2B70a05320cB069e0fB55084D402343F832556E7'.toLowerCase(),
      },
    ],
  },
  {
    sourceChainId: ChainId.arbitrum_sepolia,
    chainSelector: '3478487238524512106',
    router: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165'.toLowerCase(),
    destinations: [
      {
        destinationChainId: ChainId.sepolia,
        onRamp: '0x4205E1Ca0202A248A5D42F5975A8FE56F3E302e9'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.base_sepolia,
        onRamp: '0x7854E73C73e7F9bb5b0D5B4861E997f4C6E8dcC6'.toLowerCase(),
      },
    ],
  },
  {
    sourceChainId: ChainId.fuji,
    chainSelector: '14767482510784806043',
    router: '0xF694E193200268f9a4868e4Aa017A0118C9a8177'.toLowerCase(),
    destinations: [
      {
        destinationChainId: ChainId.sepolia,
        onRamp: '0x5724B4Cc39a9690135F7273b44Dfd3BA6c0c69aD'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.base_sepolia,
        onRamp: '0x1A674645f3EB4147543FCA7d40C5719cbd997362'.toLowerCase(),
      },
    ],
  },
  {
    sourceChainId: ChainId.base_sepolia,
    chainSelector: '10344971235874465080',
    router: '0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93'.toLowerCase(),
    destinations: [
      {
        destinationChainId: ChainId.sepolia,
        onRamp: '0x6486906bB2d85A6c0cCEf2A2831C11A2059ebfea'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.arbitrum_sepolia,
        onRamp: '0x58622a80c6DdDc072F2b527a99BE1D0934eb2b50'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.fuji,
        onRamp: '0xAbA09a1b7b9f13E05A6241292a66793Ec7d43357'.toLowerCase(),
      },
    ],
  },
];

function getChainSelectorFor(chainId: ChainId) {
  return laneConfig.find((config) => config.sourceChainId === chainId)?.chainSelector;
}

function getRouterFor(chainId: ChainId) {
  return laneConfig.find((config) => config.sourceChainId === chainId)?.router;
}

function getSupportedSourceChains() {
  return laneConfig.map((config) => config.sourceChainId);
}

// export const useBridgeTransactionStatus = (bridgeTx: BridgeTransaction) => {
//   return useQuery({
//     queryFn: async () => { },
//   });
// };

export const useGetOffRampsForSourceChain = (destinationChain: ChainId, sourceChain: ChainId) => {
  const { data: offRamps, isFetching } = useGetOffRamps();

  return {
    loading: isFetching,
    offRamps:
      offRamps
        ?.find((ramps) => ramps.chainId === destinationChain)
        ?.offRamps?.filter(
          (ramp) => ramp.sourceChainSelector === getChainSelectorFor(sourceChain)
        ) ?? [],
  };
};

export const useGetOffRamps = () => {
  return useQuery({
    queryFn: async () => {
      console.log('qeurying');
      // TODO: fix this typing disaster
      const result = await Promise.all(
        getSupportedSourceChains().map<
          Promise<{
            chainId: ChainId;
            offRamps: {
              sourceChainSelector: string;
              offRamp: string;
            }[];
          }>
        >(async (chainId) => {
          const router = getRouterFor(chainId);
          if (!router) {
            throw new Error('Router not found for chainId: ' + chainId);
          }

          const provider = getProvider(chainId);
          const routerContract = new Contract(router, routerAbi, provider);
          const offRamps = await routerContract.getOffRamps();
          const formattedOffRamps: Array<{ sourceChainSelector: string; offRamp: string }> =
            offRamps.map((ramp: { sourceChainSelector: BigNumberish; offRamp: string }) => ({
              sourceChainSelector: ramp.sourceChainSelector.toString(),
              offRamp: ramp.offRamp,
            }));

          return {
            chainId,
            offRamps: formattedOffRamps,
          };
        })
      );
      console.log('the result', result);
      return result;
    },
    queryKey: ['offRamps'],
  });
};
