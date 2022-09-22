import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { optimizedPath } from 'src/utils/utils';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface WithdrawActionsProps extends BoxProps {
  poolReserve: ComputedReserveData;
  amountToWithdraw: string;
  poolAddress: string;
  isWrongNetwork: boolean;
  symbol: string;
  blocked: boolean;
}

export const WithdrawActions = ({
  poolReserve,
  amountToWithdraw,
  poolAddress,
  isWrongNetwork,
  symbol,
  blocked,
  sx,
}: WithdrawActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  const { action, loadingTxns, mainTxState, approvalTxState, approval, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        if (currentMarketData.v3) {
          return lendingPool.withdraw({
            user: currentAccount,
            reserve: poolAddress,
            amount: amountToWithdraw,
            aTokenAddress: poolReserve.aTokenAddress,
            useOptimizedPath: optimizedPath(chainId),
          });
        } else {
          return lendingPool.withdraw({
            user: currentAccount,
            reserve: poolAddress,
            amount: amountToWithdraw,
            aTokenAddress: poolReserve.aTokenAddress,
          });
        }
      },
      skip: !amountToWithdraw || parseFloat(amountToWithdraw) === 0 || blocked,
      deps: [amountToWithdraw, poolAddress],
    });

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      approvalTxState={approvalTxState}
      mainTxState={mainTxState}
      amount={amountToWithdraw}
      isWrongNetwork={isWrongNetwork}
      requiresAmount
      actionInProgressText={<Trans>Withdrawing {symbol}</Trans>}
      actionText={<Trans>Withdraw {symbol}</Trans>}
      handleAction={action}
      handleApproval={() => approval(amountToWithdraw, poolAddress)}
      requiresApproval={requiresApproval}
      sx={sx}
    />
  );
};
