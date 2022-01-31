import { useState } from 'react';
import { useStateLoading } from './useStateLoading';
import { usePolling } from './usePolling';

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

export interface GetGasPricesHook {
  loading: boolean;
  data: ResponseGasPrice | null | undefined;
  error: boolean;
}

const POLLING_INTERVAL = 15000;

const useGetGasPrices = (): GetGasPricesHook => {
  const { loading, setLoading } = useStateLoading();
  const [error, setError] = useState(false);
  const [data, setData] = useState<ResponseGasPrice | null>();

  const apiRequest = async () => {
    try {
      setLoading(true);
      const data = await fetch('https://apiv5.paraswap.io/prices/gas/1?eip1559=true');
      const dataJson = await data.json();
      setData(dataJson as ResponseGasPrice);
      setError(false);
    } catch (err) {
      console.error(' Error on get the gas price ', err);
      setError(true);
    }
    setLoading(false);
  };

  usePolling(apiRequest, POLLING_INTERVAL, false, []);

  return { loading, data, error };
};

export default useGetGasPrices;
