import { FeeData } from '@ethersproject/abstract-provider';
import { useState } from 'react';
import { GasOption } from 'src/components/transactions/GasStation/GasStationProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useModalContext } from './useModal';
import { usePolling } from './usePolling';
import { useProtocolDataContext } from './useProtocolDataContext';

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

const useGetGasPrices = (): GetGasPricesHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<GasPriceData | null>();
  const { type } = useModalContext();
  const { currentChainId, jsonRpcProvider } = useProtocolDataContext();
  const { connected } = useWeb3Context();

  const web3Request = async () => {
    const feeData = await jsonRpcProvider().getFeeData();
    setData(rawToGasPriceData(feeData));
    setError(false);
  };

  const estimateGasPrice = async () => {
    let apiRequestError;

    try {
      await web3Request();
    } catch (web3ProviderError) {
      // Only output errors if all estimation methods fails
      console.error('Gas price retrieval from API failed', apiRequestError);
      console.error('Gas price retrieval from Web3 provider failed.', web3ProviderError);
      setError(true);
    }
    setLoading(false);
  };

  usePolling(estimateGasPrice, POLLING_INTERVAL, type === undefined, [
    connected,
    currentChainId,
    type,
  ]);

  return { loading, data, error };
};

export default useGetGasPrices;
