import { InterestRate, ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface RepayActionProps extends BoxProps {
  amountToRepay: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  debtType: InterestRate;
  repayWithATokens: boolean;
  blocked?: boolean;
  inputAmount: string;
}

export const RepayActions = ({
  amountToRepay,
  poolReserve,
  poolAddress,
  isWrongNetwork,
  sx,
  symbol,
  debtType,
  repayWithATokens,
  blocked,
  inputAmount,
  ...props
}: RepayActionProps) => {
  const { repay, repayWithPermit, tryPermit } = useRootStore();

  const usingPermit = tryPermit(poolAddress);
  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      tryPermit: usingPermit,
      permitAction: ProtocolAction.repayWithPermit,
      protocolAction: ProtocolAction.repay,
      eventTxInfo: {
        amount: inputAmount,
        amountUSD: valueToBigNumber(inputAmount).multipliedBy(poolReserve.priceInUSD).toString(10),
        assetName: poolReserve.name,
        asset: poolReserve.underlyingAsset,
      },
      handleGetTxns: async () => {
        return repay({
          amountToRepay,
          poolAddress,
          repayWithATokens,
          debtType,
        });
      },
      handleGetPermitTxns: async (signatures, deadline) => {
        return repayWithPermit({
          amountToRepay,
          poolAddress,
          debtType,
          signature: signatures[0],
          deadline,
        });
      },
      skip: !amountToRepay || parseFloat(amountToRepay) === 0 || blocked,
      deps: [amountToRepay, poolAddress, repayWithATokens],
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
      handleApproval={() => approval([{ amount: amountToRepay, underlyingAsset: poolAddress }])}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
      tryPermit={usingPermit}
    />
  );
};
