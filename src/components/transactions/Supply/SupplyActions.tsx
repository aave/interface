import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useTransactionBundleHandler } from 'src/helpers/useTransactionBundleHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface SupplyActionProps extends BoxProps {
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
}

export const SupplyActions = ({
  amountToSupply,
  poolAddress,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  ...props
}: SupplyActionProps) => {
  const { supplyBundle, tryPermit } = useRootStore();
  const usingPermit = tryPermit(poolAddress);

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionBundleHandler({
      tryPermit: usingPermit,
      signedAction: ProtocolAction.supplyWithPermit,
      handleGetBundle: async () => {
        return supplyBundle({
          amount: amountToSupply,
          reserve: poolAddress,
        });
      },
      skip: !amountToSupply || parseFloat(amountToSupply) === 0,
      deps: [amountToSupply, poolAddress],
    });

  return (
    <TxActionsWrapper
      blocked={blocked}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      requiresAmount
      amount={amountToSupply}
      symbol={symbol}
      preparingTransactions={loadingTxns}
      actionText={<Trans>Supply {symbol}</Trans>}
      actionInProgressText={<Trans>Supplying {symbol}</Trans>}
      handleApproval={() => approval()}
      handleAction={action}
      requiresApproval={requiresApproval}
      tryPermit={usingPermit}
      sx={sx}
      {...props}
    />
  );
};
