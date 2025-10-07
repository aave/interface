import { OptimalRate, TransactionParams } from '@paraswap/sdk';
import { getParaswap } from 'src/hooks/paraswap/common';

import { SwapKind } from '../../types';

export const getTransactionParams = async (
  kind: SwapKind,
  chainId: number,
  srcToken: string,
  srcDecimals: number,
  destToken: string,
  destDecimals: number,
  user: string,
  route: OptimalRate,
  maxSlippage: number
) => {
  const { paraswap, feeTarget } = getParaswap(chainId);

  console.log('route', route);
  try {
    // console.log('buildTx', {
    //   srcToken,
    //   destToken,
    //   ...(kind === 'buy' ? { destAmount: route.destAmount } : { srcAmount: route.srcAmount }),
    //   priceRoute: route,
    //   userAddress: user,
    //   partnerAddress: feeTarget,
    //   takeSurplus: true,
    //   slippage: maxSlippage * 100,
    //   srcDecimals,
    //   destDecimals,
    //   isDirectFeeTransfer: true,
    // });

    const params = await paraswap.buildTx(
      {
        srcToken,
        destToken,
        ...(kind === 'buy' ? { destAmount: route.destAmount } : { srcAmount: route.srcAmount }),
        slippage: maxSlippage * 100,
        priceRoute: route,
        userAddress: user,
        partnerAddress: feeTarget,
        srcDecimals,
        destDecimals,
        isDirectFeeTransfer: true,
        takeSurplus: true,
      },
      { ignoreChecks: true }
    );

    return {
      swapCallData: (params as TransactionParams).data,
      augustus: (params as TransactionParams).to,
    };
  } catch (e) {
    console.error(e);
    throw new Error('Error building transaction parameters');
  }
};
