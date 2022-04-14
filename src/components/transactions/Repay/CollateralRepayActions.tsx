import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { OptimalRate } from 'paraswap-core';
import { getRepayCallData } from 'src/hooks/useSwap';

export interface RepayActionProps extends BoxProps {
  rateMode: InterestRate;
  repayAmount: string;
  repayWithAmount: string;
  fromAssetData: ComputedReserveData;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  priceRoute: OptimalRate | null;
  repayAllDebt: boolean;
  useFlashLoan: boolean;
  blocked: boolean;
}

export const CollateralRepayActions = ({
  repayAmount,
  repayWithAmount,
  poolReserve,
  fromAssetData,
  isWrongNetwork,
  sx,
  symbol,
  rateMode,
  priceRoute,
  repayAllDebt,
  useFlashLoan,
  blocked,
  ...props
}: RepayActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentNetworkConfig } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      handleGetTxns: async () => {
        const { swapCallData, augustus } = await getRepayCallData({
          srcToken: fromAssetData.underlyingAsset,
          srcDecimals: fromAssetData.decimals,
          destToken: poolReserve.underlyingAsset,
          destDecimals: poolReserve.decimals,
          user: currentAccount,
          route: priceRoute as OptimalRate,
          chainId: currentNetworkConfig.underlyingChainId || chainId,
          repayWithAmount,
        });
        return lendingPool.paraswapRepayWithCollateral({
          user: currentAccount,
          fromAsset: fromAssetData.underlyingAsset,
          fromAToken: fromAssetData.aTokenAddress,
          assetToRepay: poolReserve.underlyingAsset,
          repayWithAmount,
          repayAmount,
          repayAllDebt,
          rateMode,
          flash: useFlashLoan,
          swapAndRepayCallData: swapCallData,
          augustus,
        });
      },
      skip: !repayAmount || parseFloat(repayAmount) === 0 || blocked,
      deps: [
        repayWithAmount,
        repayAmount,
        priceRoute,
        poolReserve.underlyingAsset,
        fromAssetData.underlyingAsset,
        repayAllDebt,
        currentAccount,
        useFlashLoan,
      ],
    });

  return (
    <TxActionsWrapper
      preparingTransactions={loadingTxns}
      symbol={poolReserve.symbol}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={repayAmount}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
      handleAction={action}
      handleApproval={() => approval()}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
    />
  );
};
