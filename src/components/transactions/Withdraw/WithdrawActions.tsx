import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface WithdrawActionsProps extends BoxProps {
  poolReserve: ComputedReserveData;
  amountToWithdraw: string;
  poolAddress: string;
  isWrongNetwork: boolean;
  symbol: string;
  blocked: boolean;
  nativeBalance: string;
}

export const WithdrawActions = ({
  poolReserve,
  amountToWithdraw,
  poolAddress,
  isWrongNetwork,
  symbol,
  blocked,
  nativeBalance,
  sx,
}: WithdrawActionsProps) => {
  const [withdraw, v37Overrides] = useRootStore(
    useShallow((state) => [state.withdraw, state.v37Overrides])
  );

  const { action, loadingTxns, mainTxState, approvalTxState, approval, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        const txs = await withdraw({
          reserve: poolAddress,
          amount: amountToWithdraw,
          aTokenAddress: poolReserve.aTokenAddress,
        });

        if (!v37Overrides) return txs;

        const mappedTxs = txs.map((tx) => ({
          ...tx,
          tx: async () => {
            const txData = await tx.tx();
            if (tx.txType === 'ERC20_APPROVAL') return txData;
            const balance = parseEther(nativeBalance);
            const gasBuffer = parseEther('0.02');
            const value = balance.gt(gasBuffer) ? balance.sub(gasBuffer).toString() : '0';
            return {
              ...txData,
              value,
              gasLimit: BigNumber.from(gasLimitRecommendations[ProtocolAction.withdraw].recommended),
            };
          },
        }));
        return mappedTxs;
      },
      skip: !amountToWithdraw || parseFloat(amountToWithdraw) === 0 || blocked,
      deps: [amountToWithdraw, poolAddress],
      eventTxInfo: {
        amount: amountToWithdraw,
        assetName: poolReserve.name,
        asset: poolReserve.underlyingAsset,
        amountUsd: valueToBigNumber(amountToWithdraw)
          .multipliedBy(poolReserve.priceInUSD)
          .toString(),
      },
      protocolAction: ProtocolAction.withdraw,
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
      handleApproval={() => approval([{ amount: amountToWithdraw, underlyingAsset: poolAddress }])}
      requiresApproval={requiresApproval}
      sx={sx}
    />
  );
};
