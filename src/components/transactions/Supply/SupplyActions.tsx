import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
// import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface SupplyActionProps extends BoxProps {
  amountToSupply: string;
  // poolReserve: ComputedReserveData;
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
  const { supply, supplyWithPermit, tryPermit } = useRootStore();
  const usingPermit = tryPermit(poolAddress);

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      tryPermit: usingPermit,
      permitAction: ProtocolAction.supplyWithPermit,
      handleGetTxns: async () => {
        return supply({
          amountToSupply,
          isWrongNetwork,
          poolAddress,
          symbol,
          blocked,
        });
      },
      handleGetPermitTxns: async (signatures, deadline) => {
        return supplyWithPermit({
          reserve: poolAddress,
          amount: amountToSupply,
          signature: signatures[0],
          deadline,
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
      handleApproval={() => approval([{ amount: amountToSupply, underlyingAsset: poolAddress }])}
      handleAction={action}
      requiresApproval={requiresApproval}
      tryPermit={usingPermit}
      sx={sx}
      {...props}
    />
  );
};
