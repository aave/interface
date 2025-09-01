import { OptimalRate, SwapSide } from '@paraswap/sdk';
import { constants } from 'ethers';
import {
  ParaswapRatesType,
  ProviderRatesParams,
} from 'src/components/transactions/Switch/switch.types';

import { getParaswap } from '../paraswap/common';

export async function getParaswapSellRates({
  chainId,
  amount,
  srcToken,
  srcDecimals,
  destToken,
  destDecimals,
  user,
  options = {},
}: ProviderRatesParams): Promise<ParaswapRatesType> {
  const { paraswap } = getParaswap(chainId);
  return paraswap
    .getRate({
      amount,
      srcToken,
      srcDecimals,
      destToken,
      destDecimals,
      userAddress: user ? user : constants.AddressZero,
      side: SwapSide.SELL,
      options: {
        ...options,
        excludeDEXS: [
          'ParaSwapPool',
          'ParaSwapLimitOrders',
          'SwaapV2',
          'Hashflow',
          'Dexalot',
          'Bebop',
        ],
      },
    })
    .then((paraSwapResponse: OptimalRate) => ({
      srcToken,
      srcUSD: paraSwapResponse.srcUSD,
      srcAmount: paraSwapResponse.srcAmount,
      srcDecimals,
      destToken,
      destUSD: paraSwapResponse.destUSD,
      destAmount: paraSwapResponse.destAmount,
      destDecimals,
      provider: 'paraswap',
      optimalRateData: paraSwapResponse,
    }));
}
