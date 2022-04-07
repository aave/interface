import { InterestRate, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { utils } from 'ethers';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { permitByChainAndToken } from 'src/ui-config/permitConfig';
import { optimizedPath } from 'src/utils/utils';

import { GasOption } from '../GasStation/GasStationProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';
import { OptimalRate } from 'paraswap-core';
import { getSwapCallData } from 'src/hooks/useSwap';

export interface RepayActionProps extends BoxProps {
  debtType: InterestRate;
  amountToRepay: string;
  amountToSwap: string;
  poolReserve: ComputedReserveData;
  targetReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  priceRoute: OptimalRate | null;
  isMaxSelected: boolean;
  useFlashLoan: boolean;
}

export const CollateralRepayActions = ({
  amountToRepay,
  poolReserve,
  targetReserve,
  isWrongNetwork,
  sx,
  symbol,
  debtType,
  blocked,
  priceRoute,
  ...props
}: RepayActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      handleGetTxns: async () => {
        const { swapCallData, augustus } = await getSwapCallData({
          srcToken: poolReserve.underlyingAsset,
          srcDecimals: poolReserve.decimals,
          destToken: targetReserve.underlyingAsset,
          destDecimals: targetReserve.decimals,
          user: currentAccount,
          route: priceRoute as OptimalRate,
          chainId: chainId,
        });
        const newPool: Pool = lendingPool as Pool;
        return newPool.paraswapRepayWithCollateral({
          user: currentAccount,
          fromAsset: poolReserve.underlyingAsset,
          fromAToken: poolReserve.aTokenAddress,
          assetToRepay: targetReserve.underlyingAsset,
          repayWithAmount: amountToRepay, // ?? is this correct?
          repayAmount: '',
          repayAllDebt: isMaxSelected,
          rateMode: debtType,
          flash: useFlashLoan,
          swapAndRepayCallData: swapCallData,
          augustus,
        });
      },
      customGasPrice:
        state.gasOption === GasOption.Custom
          ? state.customGas
          : gasPriceData.data?.[state.gasOption].legacyGasPrice,
      skip: !amountToRepay || parseFloat(amountToRepay) === 0 || blocked,
      deps: [amountToRepay],
    });

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      symbol={poolReserve.symbol}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={amountToRepay}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
      handleAction={action}
      handleApproval={() => approval(amountToRepay, poolReserve.underlyingAsset)}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
    />
  );
};
