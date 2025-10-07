import { OrderKind, TradeParameters, TradingSdk } from '@cowprotocol/cow-sdk';
import { AaveCollateralSwapSdk, CollateralSwapParams } from '@cowprotocol/sdk-flash-loans';

import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import { SwapState } from '../../types';
import { getCowAdapter } from './orders.helpers';

const FLASH_LOAN_FEE_PERCENT = 0; // TODO: check

export const collateralSwap = async (state: SwapState) => {
  const tradingSdk = new TradingSdk(
    {
      chainId: state.chainId,
      appCode: APP_CODE_PER_SWAP_TYPE[state.swapType],
    },
    {},
    await getCowAdapter(state.chainId)
  );

  const collateralSwapSdk = new AaveCollateralSwapSdk();

  const tradeParameters: TradeParameters = {
    kind: OrderKind.SELL,
    sellToken: state.sourceToken.addressToSwap,
    sellTokenDecimals: state.sourceToken.decimals,
    buyToken: state.destinationToken.addressToSwap,
    buyTokenDecimals: state.destinationToken.decimals,
    amount: state.inputAmount,
  };

  const params: CollateralSwapParams = {
    chainId: state.chainId,
    tradeParameters: tradeParameters,
    collateralToken: state.destinationToken.addressToSwap,
    flashLoanFeePercent: FLASH_LOAN_FEE_PERCENT,
    settings: {
      collateralPermit: {
        amount: state.inputAmount,
        deadline: state.expiry,
        v: 0,
        r: '0',
        s: '0',
      },
    },
  };

  const order = await collateralSwapSdk.collateralSwap(params, tradingSdk);

  return order;
};
