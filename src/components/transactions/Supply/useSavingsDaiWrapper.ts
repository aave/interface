import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { useRootStore } from 'src/store/root';

export const useSavingsDaiWrapper = ({
  supplyAmount,
  decimals,
}: {
  supplyAmount: string;
  decimals: number;
}) => {
  const getSavingsDaiForDai = useRootStore((state) => state.getSavingsDaiForDai);
  const [loading, setLoading] = useState(false);
  const [tokenOutAmount, setTokenOutAmount] = useState('0');

  useEffect(() => {
    if (!supplyAmount || supplyAmount === '0') {
      setTokenOutAmount('0');
      return;
    }

    const getTokenOutForTokenIn = async () => {
      const amount = parseUnits(supplyAmount, decimals).toString();
      const tokenOut = await getSavingsDaiForDai(amount);
      const outAmount = formatUnits(tokenOut.toString(), decimals);
      // console.log('out amount', outAmount);
      setTokenOutAmount(outAmount);
      setLoading(false);
    };

    setLoading(true);
    const timeout = setTimeout(() => {
      getTokenOutForTokenIn();
    }, 2000);

    return () => {
      clearTimeout(timeout);
      // setLoading(false);
    };
  }, [decimals, getSavingsDaiForDai, supplyAmount]);

  return {
    loading,
    tokenOutAmount,
  };
};

export const useDaiForSavingsDaiWrapper = ({
  withdrawAmount,
  decimals,
}: {
  withdrawAmount: string;
  decimals: number;
}) => {
  const getDaiForSavingsDai = useRootStore((state) => state.getDaiForSavingsDai);
  const [loading, setLoading] = useState(false);
  const [tokenInAmount, setTokenInAmount] = useState('0');

  useEffect(() => {
    if (!withdrawAmount || withdrawAmount === '0') {
      setTokenInAmount('0');
      return;
    }

    const getTokenInForTokenOut = async () => {
      const amount = parseUnits(withdrawAmount, decimals).toString();
      const tokenOut = await getDaiForSavingsDai(amount);
      const outAmount = formatUnits(tokenOut.toString(), decimals);
      // console.log('out amount', outAmount);
      setTokenInAmount(outAmount);
      setLoading(false);
    };

    setLoading(true);
    const timeout = setTimeout(() => {
      getTokenInForTokenOut();
    }, 2000);

    return () => {
      clearTimeout(timeout);
      // setLoading(false);
    };
  }, [decimals, getDaiForSavingsDai, withdrawAmount]);

  return {
    loading,
    tokenInAmount,
  };
};
