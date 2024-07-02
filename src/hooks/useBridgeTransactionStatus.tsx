import { ChainId } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import { BigNumberish, Contract } from 'ethers';
import {
  getChainSelectorFor,
  getRouterFor,
  getSupportedSourceChains,
  MessageExecutionState,
} from 'src/components/transactions/Bridge/BridgeConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import routerAbi from '../components/transactions/Bridge/Router-abi.json';

export const useGetExecutionState = (
  chainId: ChainId,
  sequenceNumber: string,
  offRamps: string[]
) => {
  return useQuery({
    queryFn: async () => {
      const provider = getProvider(chainId);
      // Since there could be multiple off ramps for a lane, iterate over all and return the first one that is not untouched
      // If all are untouched, then the transaction is still in progress.
      for (const offRamp of offRamps) {
        try {
          const offRampContract = new Contract(
            offRamp,
            ['function getExecutionState(uint64 sequenceNumber) public view returns (uint8)'],
            provider
          );
          const result = await offRampContract.getExecutionState(Number(sequenceNumber));
          if (result !== MessageExecutionState.UNTOUCHED) {
            return result as MessageExecutionState;
          }
        } catch (e) {
          console.error(e);
        }
      }

      return MessageExecutionState.UNTOUCHED;
    },
    queryKey: ['executionState', chainId, sequenceNumber],
    enabled: offRamps?.length > 0,
    refetchInterval: (data) => {
      // Retry every 60 seconds if the transaction state is not SUCCESS
      if (data === MessageExecutionState.SUCCESS) {
        return false;
      }

      return 1000 * 60;
    },
  });
};

export const useGetOffRampForLane = (sourceChain: ChainId, destinationChain: ChainId) => {
  const { data: offRamps, isFetching } = useGetOffRamps();

  return {
    loading: isFetching,
    offRamps:
      offRamps
        ?.find((ramps) => ramps.chainId === destinationChain)
        ?.offRamps?.filter(
          (ramp) => ramp.sourceChainSelector === getChainSelectorFor(sourceChain)
        ) ?? [], // there could be multiple off ramps
  };
};

type OffRamp = {
  sourceChainSelector: string;
  offRamp: string;
};

export const useGetOffRamps = () => {
  return useQuery({
    queryFn: async () => {
      const result = await Promise.all(
        getSupportedSourceChains().map<
          Promise<{
            chainId: ChainId;
            offRamps: OffRamp[];
          }>
        >(async (chainId) => {
          const router = getRouterFor(chainId);
          const provider = getProvider(chainId);
          const routerContract = new Contract(router, routerAbi, provider);
          const offRamps = await routerContract.getOffRamps();
          const formattedOffRamps: OffRamp[] = offRamps.map(
            (ramp: { sourceChainSelector: BigNumberish; offRamp: string }) => ({
              sourceChainSelector: ramp.sourceChainSelector.toString(),
              offRamp: ramp.offRamp,
            })
          );

          return {
            chainId,
            offRamps: formattedOffRamps,
          };
        })
      );
      return result;
    },
    queryKey: ['offRamps'],
  });
};
