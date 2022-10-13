import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type FaucetActionsProps = {
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  blocked: boolean;
};

export const FaucetActions = ({ poolReserve, isWrongNetwork, blocked }: FaucetActionsProps) => {
  const mint = useRootStore((state) => state.mint);
  const { currentAccount } = useWeb3Context();

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return mint({
        userAddress: currentAccount,
        tokenSymbol: poolReserve.symbol,
        reserve: poolReserve.underlyingAsset,
      });
    },
    skip: blocked,
  });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<Trans>Faucet {poolReserve.symbol}</Trans>}
      actionInProgressText={<Trans>Pending...</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
    />
  );
};
