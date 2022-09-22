import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { optimizedPath } from 'src/utils/utils';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface BorrowActionsProps extends BoxProps {
  poolReserve: ComputedReserveData;
  amountToBorrow: string;
  poolAddress: string;
  interestRateMode: InterestRate;
  isWrongNetwork: boolean;
  symbol: string;
  blocked: boolean;
}

export const BorrowActions = ({
  symbol,
  poolReserve,
  amountToBorrow,
  poolAddress,
  interestRateMode,
  isWrongNetwork,
  blocked,
  sx,
}: BorrowActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  const { action, loadingTxns, mainTxState, approval, requiresApproval, approvalTxState } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        if (currentMarketData.v3) {
          return lendingPool.borrow({
            interestRateMode,
            user: currentAccount,
            amount: amountToBorrow,
            reserve: poolAddress,
            debtTokenAddress:
              interestRateMode === InterestRate.Variable
                ? poolReserve.variableDebtTokenAddress
                : poolReserve.stableDebtTokenAddress,
            useOptimizedPath: optimizedPath(chainId),
          });
        } else {
          return lendingPool.borrow({
            interestRateMode,
            user: currentAccount,
            amount: amountToBorrow,
            reserve: poolAddress,
            debtTokenAddress:
              interestRateMode === InterestRate.Variable
                ? poolReserve.variableDebtTokenAddress
                : poolReserve.stableDebtTokenAddress,
          });
        }
      },
      skip: !amountToBorrow || amountToBorrow === '0' || blocked,
      deps: [amountToBorrow, interestRateMode],
    });

  return (
    <TxActionsWrapper
      blocked={blocked}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount={true}
      amount={amountToBorrow}
      isWrongNetwork={isWrongNetwork}
      handleAction={action}
      actionText={<Trans>Borrow {symbol}</Trans>}
      actionInProgressText={<Trans>Borrowing {symbol}</Trans>}
      handleApproval={() => approval(amountToBorrow, poolAddress)}
      requiresApproval={requiresApproval}
      preparingTransactions={loadingTxns}
      sx={sx}
    />
  );
};
