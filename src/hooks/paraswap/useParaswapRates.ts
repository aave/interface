import { OptimalRate, SwapSide } from '@paraswap/sdk';
import { RateOptions } from '@paraswap/sdk/dist/methods/swap/rates';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BigNumber, constants, PopulatedTransaction } from 'ethers';
import { queryKeysFactory } from 'src/ui-config/queries';

import { getFeeClaimerAddress, getParaswap } from './common';

type ParaSwapSellRatesParams = {
  amount: string;
  srcToken: string;
  srcDecimals: number;
  destToken: string;
  destDecimals: number;
  chainId: number;
  user: string;
  options?: RateOptions;
};

export const useParaswapSellRates = ({
  chainId,
  amount,
  srcToken,
  srcDecimals,
  destToken,
  destDecimals,
  user,
  options = {},
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
        options: {
          ...options,
          excludeDEXS: ['ParaSwapPool', 'ParaSwapLimitOrders'],
        },
      });
    },
    queryKey: queryKeysFactory.paraswapRates(chainId, amount, srcToken, destToken, user),
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
  partner?: string;
};

export const useParaswapSellTxParams = (chainId: number) => {
  const FEE_CLAIMER_ADDRESS = getFeeClaimerAddress(chainId);
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
      partner,
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
          takeSurplus: true,
          partner,
          partnerAddress: FEE_CLAIMER_ADDRESS,
          permit,
          deadline,
        },
        { ignoreChecks: true }
      );
      return {
        ...response,
        gasLimit: BigNumber.from('500000'),
        gasPrice: undefined,
        value: BigNumber.from(response.value),
      };
    },
  });
};
