import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { optimizedPath } from 'src/utils/utils';
import { GasOption } from '../GasStation/GasStationProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';

export type WithdrawActionsProps = {
  poolReserve: ComputedReserveData;
  amountToWithdraw: string;
  poolAddress: string;
  isWrongNetwork: boolean;
  symbol: string;
  blocked: boolean;
};

export const WithdrawActions = ({
  poolReserve,
  amountToWithdraw,
  poolAddress,
  isWrongNetwork,
  symbol,
  blocked,
}: WithdrawActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

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
      customGasPrice:
        state.gasOption === GasOption.Custom
          ? state.customGas
          : gasPriceData.data?.[state.gasOption].legacyGasPrice,
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
    />
  );
};
