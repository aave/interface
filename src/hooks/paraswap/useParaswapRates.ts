import { OptimalRate } from '@paraswap/sdk';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BigNumber, PopulatedTransaction } from 'ethers';
import { QueryKeys } from 'src/ui-config/queries';

import { ExactInSwapper, FEE_CLAIMER_ADDRESS, getParaswap } from './common';

type ParaSwapSellRatesParams = {
  amount?: string;
  srcToken?: string;
  srcDecimals?: number;
  destToken?: string;
  destDecimals?: number;
  chainId?: number;
  user?: string;
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
    queryFn: async () => {
      if (
        !!(
          chainId &&
          amount &&
          srcToken &&
          srcDecimals &&
          destToken &&
          destDecimals &&
          user &&
          amount !== '0'
        )
      ) {
        const swapper = ExactInSwapper(chainId);
        return swapper.getRate(amount, srcToken, srcDecimals, destToken, destDecimals, user, {
          partner: 'aave',
        });
      }
    },
    queryKey: [QueryKeys.PARASWAP_RATES, chainId, amount, srcToken, destToken, user],
    enabled: !!(
      chainId &&
      amount &&
      srcToken &&
      srcDecimals &&
      destToken &&
      destDecimals &&
      user &&
      amount !== '0'
    ),
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
          partnerAddress: FEE_CLAIMER_ADDRESS,
          positiveSlippageToUser: false,
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
