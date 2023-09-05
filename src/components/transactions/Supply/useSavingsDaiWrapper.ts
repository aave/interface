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

    const getTokenInForTokenOut = async () => {
      const amount = parseUnits(supplyAmount, decimals).toString();
      const tokenOut = await getSavingsDaiForDai(amount);
      const outAmount = formatUnits(tokenOut.toString(), decimals);
      // console.log('out amount', outAmount);
      setTokenOutAmount(outAmount);
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
  }, [decimals, getSavingsDaiForDai, supplyAmount]);

  return {
    loading,
    tokenOutAmount,
  };
};
