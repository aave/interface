import { OptimalRate, SwapSide } from '@paraswap/sdk';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BigNumber, constants, PopulatedTransaction } from 'ethers';
import { QueryKeys } from 'src/ui-config/queries';

import { getParaswap } from './common';

type ParaSwapSellRatesParams = {
  amount: string;
  srcToken: string;
  srcDecimals: number;
  destToken: string;
  destDecimals: number;
  chainId: number;
  user: string;
};

export const useParaswapSellRates = ({
  chainId,
  amount,
  srcToken,
  srcDecimals,
  destToken,
  destDecimals,
  user,
}: ParaSwapSellRatesParams) => {
  return useQuery<OptimalRate | undefined>({
    queryFn: () => {
      const paraswap = getParaswap(chainId);
      return paraswap.getRate({
        amount,
        srcToken,
        srcDecimals,
        destToken,
        destDecimals,
        userAddress: user ? user : constants.AddressZero,
        side: SwapSide.SELL,
      });
    },
    queryKey: [QueryKeys.PARASWAP_RATES, chainId, amount, srcToken, destToken, user],
    enabled: amount !== '0',
    retry: 0,
    refetchOnWindowFocus: (query) => (query.state.error ? false : true),
  });
};

type UseParaswapSellTxParams = {
  srcToken: string;
  srcDecimals: number;
  destToken: string;
  destDecimals: number;
  user: string;
  route: OptimalRate;
  maxSlippage: number;
  permit?: string;
  deadline?: string;
};

export const useParaswapSellTxParams = (chainId: number) => {
  return useMutation<PopulatedTransaction, unknown, UseParaswapSellTxParams>({
    mutationFn: async ({
      srcToken,
      srcDecimals,
      destToken,
      destDecimals,
      user,
      route,
      maxSlippage,
      permit,
      deadline,
    }: UseParaswapSellTxParams) => {
      const paraswap = getParaswap(chainId);
      const response = await paraswap.buildTx(
        {
          srcToken,
          srcDecimals,
          srcAmount: route.srcAmount,
          destToken,
          destDecimals,
          userAddress: user,
          priceRoute: route,
          slippage: maxSlippage,
          positiveSlippageToUser: true,
          permit,
          deadline,
        },
        { ignoreChecks: true }
      );
      return {
        ...response,
        gasLimit: BigNumber.from(response.gas || '10000000'),
        gasPrice: BigNumber.from(response.gasPrice),
        value: BigNumber.from(response.value || '0'),
      };
    },
  });
};
