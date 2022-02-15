import { FeeData } from '@ethersproject/abstract-provider';
import { useState } from 'react';
import { GasOption } from 'src/components/transactions/GasStation/GasStationProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useModalContext } from './useModal';
import { usePolling } from './usePolling';
import { useProtocolDataContext } from './useProtocolDataContext';
import { useStateLoading } from './useStateLoading';

type GasInfo = {
  legacyGasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
};

export type ResponseGasPrice = {
  safeLow: GasInfo;
  average: GasInfo;
  fast: GasInfo;
  fastest: GasInfo;
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
  const { loading, setLoading } = useStateLoading(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<GasPriceData | null>();
  const { type } = useModalContext();
  const { currentChainId, jsonRpcProvider } = useProtocolDataContext();
  const { connected } = useWeb3Context();

  const apiRequest = async () => {
    if (connected && type !== undefined) {
      setLoading(true);
      const data = await fetch(
        `https://apiv5.paraswap.io/prices/gas/${currentChainId}?eip1559=true`
      );
      if (!data.ok) {
        throw {
          error: data.statusText,
          body: await data.json(),
        };
      }
      const dataJson = (await data.json()) as ResponseGasPrice;
      const gasPricesData: GasPriceData = {
        [GasOption.Slow]: dataJson.safeLow,
        [GasOption.Normal]: dataJson.average,
        [GasOption.Fast]: dataJson.fast,
      };
      setData(gasPricesData);
      setError(false);
    }
  };

  const web3Request = async () => {
    if (jsonRpcProvider) {
      const feeData = await jsonRpcProvider.getFeeData();
      setData(rawToGasPriceData(feeData));
      setError(false);
    }
  };

  const estimateGasPrice = async () => {
    let apiRequestError;

    // Call to Paraswap API
    try {
      await apiRequest();
      return;
    } catch (err) {
      apiRequestError = err;
    }

    // If fails (fn not returned), call to `getFeeData` via Web3 Provider.
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
