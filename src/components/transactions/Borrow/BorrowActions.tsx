import { InterestRate, ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';

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
  const { currentMarket } = useProtocolDataContext();

  const borrow = useRootStore((state) => state.borrow);
  const { action, loadingTxns, mainTxState, approval, requiresApproval, approvalTxState } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        return borrow({
          interestRateMode,
          amount: amountToBorrow,
          reserve: poolAddress,
          debtTokenAddress:
            interestRateMode === InterestRate.Variable
              ? poolReserve.variableDebtTokenAddress
              : poolReserve.stableDebtTokenAddress,
        });
      },
      skip: !amountToBorrow || amountToBorrow === '0' || blocked,
      protocolAction: ProtocolAction.borrow,
      deps: [amountToBorrow, interestRateMode, poolAddress],
      eventTxInfo: {
        amount: amountToBorrow,
        assetName: poolReserve.name,
        asset: poolReserve.underlyingAsset,
        market: currentMarket,
      },
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
      handleApproval={() => approval([{ amount: amountToBorrow, underlyingAsset: poolAddress }])}
      requiresApproval={requiresApproval}
      preparingTransactions={loadingTxns}
      sx={sx}
    />
  );
};
