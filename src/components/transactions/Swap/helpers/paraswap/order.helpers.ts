import { SignatureLike } from '@ethersproject/bytes';
import { BoxProps } from '@mui/material';
import { OptimalRate, TransactionParams } from '@paraswap/sdk';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
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

  try {
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
    console.error(e, {
      srcToken,
      destToken,
      ...(kind === 'buy' ? { destAmount: route.destAmount } : { srcAmount: route.srcAmount }),
      priceRoute: route,
      userAddress: user,
      partnerAddress: feeTarget,
      takeSurplus: true,
      slippage: maxSlippage * 100,
      srcDecimals,
    });
    throw new Error('Error building transaction parameters');
  }
};

export interface SwapBaseProps extends BoxProps {
  amountToSwap: string;
  amountToReceive: string;
  poolReserve: ComputedReserveData;
  targetReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  isMaxSelected: boolean;
  useFlashLoan: boolean;
  loading?: boolean;
  signature?: SignatureLike;
  deadline?: string;
  signedAmount?: string;
}

export interface SwapActionProps extends SwapBaseProps {
  swapCallData: string;
  augustus: string;
}
