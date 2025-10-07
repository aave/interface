import { OptimalRate, SwapSide } from '@paraswap/sdk';
import { constants } from 'ethers';

import { getParaswap } from '../../../../../hooks/paraswap/common';
import { ParaswapRatesType, ProviderRatesParams, SwapProvider } from '../../types';

export async function getParaswapSellRates({
  chainId,
  amount,
  srcToken,
  srcDecimals,
  destToken,
  destDecimals,
  user,
  side = 'sell',
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
      side: side === 'buy' ? SwapSide.BUY : SwapSide.SELL,
      options: {
        ...options,
        includeContractMethods: [
          // side === "buy" ? ContractMethod.swapExactAmountIn : ContractMethod.swapExactAmountOut,
        ],
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
      provider: SwapProvider.PARASWAP,
      optimalRateData: paraSwapResponse,
    }));
}
