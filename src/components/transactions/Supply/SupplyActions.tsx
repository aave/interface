import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import React from 'react';
import { useTransactionBundleHandler } from 'src/helpers/useTransactionBundleHandler';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface SupplyActionProps extends BoxProps {
  amountToSupply: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
}

export const SupplyActions = React.memo(
  ({
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
        handleGetBundle: async () => {
          return supplyBundle({
            amount: !!amountToSupply ? amountToSupply : '1',
            reserve: poolAddress,
          });
        },
        nullState: !amountToSupply || parseFloat(amountToSupply) === 0,
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
  }
);
