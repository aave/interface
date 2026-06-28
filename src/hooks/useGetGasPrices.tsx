import { FeeData } from '@ethersproject/abstract-provider';
import { useQueries } from '@tanstack/react-query';
import { GasOption } from 'src/components/transactions/GasStation/GasStationProvider';
import { useRootStore } from 'src/store/root';
import { queryKeysFactory } from 'src/ui-config/queries';

type GasInfo = {
  legacyGasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
};

export type GasPriceData = {
  [GasOption.Slow]: GasInfo;
  [GasOption.Normal]: GasInfo;
  [GasOption.Fast]: GasInfo;
};

export interface GetGasPricesHook {
  loading: boolean;
  data: GasPriceData | null | undefined;
  error: boolean;
}

const POLLING_INTERVAL = 30000;

export const rawToGasPriceData = (feeData: FeeData): GasPriceData => {
  const gasInfo: GasInfo = {
    legacyGasPrice: feeData.gasPrice?.toString() || '0',
    maxFeePerGas: feeData.maxFeePerGas?.toString() || '0',
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || '0',
  };

  return {
    [GasOption.Slow]: gasInfo,
    [GasOption.Normal]: gasInfo,
    [GasOption.Fast]: gasInfo,
  };
};

export const useGasPrices = (chainIds: number[]) => {
  const jsonRpcProvider = useRootStore((store) => store.jsonRpcProvider);
  return useQueries({
    queries: chainIds.map((chainId) => ({
      queryKey: queryKeysFactory.gasPrices(chainId),
      queryFn: () =>
        jsonRpcProvider(chainId)
          .getFeeData()
          .then((feeData) => rawToGasPriceData(feeData)),
      refetchInterval: POLLING_INTERVAL,
    })),
  });
};

export const useGasPrice = (chainId: number) => {
  return useGasPrices([chainId])[0];
};
