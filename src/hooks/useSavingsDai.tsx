import { SavingsDaiTokenWrapperService } from '@aave/contract-helpers';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { QueryKeys } from 'src/ui-config/queries';

export const useSavingsDaiForDai = ({
  amount,
  decimals,
  skip,
}: {
  amount: string;
  decimals: number;
  skip?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [tokenInAmount, setTokenInAmount] = useState('0');
  const { data, isFetching } = useGetSavingsDaiForDai(tokenInAmount);

  useEffect(() => {
    if (!amount || skip) {
      setTokenInAmount('0');
      return;
    }

    setLoading(true);

    const timeout = setTimeout(() => {
      setTokenInAmount(parseUnits(amount, decimals).toString());
      setLoading(false);
    }, 400);

    return () => {
      clearTimeout(timeout);
      setLoading(false);
    };
  }, [decimals, amount, skip]);

  return {
    tokenOutAmount: data,
    loading: loading || isFetching,
  };
};

export const useDaiForSavingsDai = ({
  amount,
  decimals,
  skip,
}: {
  amount: string;
  decimals: number;
  skip?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [tokenOutAmount, setTokenOutAmount] = useState('0');
  const { data, isFetching } = useGetDaiForSavingsDai(tokenOutAmount);

  useEffect(() => {
    if (!amount || skip) {
      setTokenOutAmount('0');
      return;
    }

    setLoading(true);

    const timeout = setTimeout(() => {
      setTokenOutAmount(parseUnits(amount, decimals).toString());
      setLoading(false);
    }, 400);

    return () => {
      clearTimeout(timeout);
      setLoading(false);
    };
  }, [decimals, amount, skip]);

  return {
    tokenInAmount: data,
    loading: loading || isFetching,
  };
};

export const useGetDaiForSavingsDai = (parsedAmount: string) => {
  const service = useSavingsDaiService();

  return useQuery({
    queryFn: () => {
      if (!parsedAmount || parsedAmount === '0') {
        return Promise.resolve(BigNumber.from(0));
      }
      return service.getTokenInForTokenOut(parsedAmount);
    },
    queryKey: [QueryKeys.DAI_FOR_SAVINGS_DAI, parsedAmount],
    select: (data) => formatUnits(data.toString(), 18),
    initialData: BigNumber.from(0),
    cacheTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useGetSavingsDaiForDai = (parsedAmount: string) => {
  const service = useSavingsDaiService();

  return useQuery({
    queryFn: () => {
      if (!parsedAmount || parsedAmount === '0') {
        return Promise.resolve(BigNumber.from(0));
      }
      return service.getTokenOutForTokenIn(parsedAmount);
    },
    queryKey: [QueryKeys.SAVINGS_DAI_FOR_DAI, parsedAmount],
    select: (data) => formatUnits(data.toString(), 18),
    cacheTime: 0,
    initialData: BigNumber.from(0),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

const useSavingsDaiService = () => {
  const [provider, marketConfig] = useRootStore((store) => [
    store.jsonRpcProvider,
    store.currentMarketData,
  ]);

  const service = useMemo(() => {
    const tokenWrapper = marketConfig.addresses.SDAI_TOKEN_WRAPPER;
    if (!tokenWrapper) {
      throw Error('sDAI wrapper is not configured');
    }

    return new SavingsDaiTokenWrapperService(provider(), tokenWrapper);
  }, [provider, marketConfig.addresses.SDAI_TOKEN_WRAPPER]);

  return service;
};
