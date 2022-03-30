import { Trans } from '@lingui/macro';
import { Reward } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type ClaimRewardsActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  selectedReward: Reward;
};

export const ClaimRewardsActions = ({
  isWrongNetwork,
  blocked,
  selectedReward,
}: ClaimRewardsActionsProps) => {
  const { incentivesTxBuilderV2, incentivesTxBuilder } = useTxBuilderContext();
  const { currentMarketData } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      if (currentMarketData.v3) {
        if (selectedReward.symbol === 'all') {
          return incentivesTxBuilderV2.claimAllRewards({
            user: currentAccount,
            assets: selectedReward.assets,
            to: currentAccount,
            incentivesControllerAddress: selectedReward.incentiveControllerAddress,
          });
        } else {
          return incentivesTxBuilderV2.claimRewards({
            user: currentAccount,
            assets: selectedReward.assets,
            to: currentAccount,
            incentivesControllerAddress: selectedReward.incentiveControllerAddress,
            reward: selectedReward.rewardTokenAddress,
          });
        }
      } else {
        return incentivesTxBuilder.claimRewards({
          user: currentAccount,
          assets: selectedReward.assets,
          to: currentAccount,
          incentivesControllerAddress: selectedReward.incentiveControllerAddress,
        });
      }
    },
    skip: Object.keys(selectedReward).length === 0 || blocked,
    deps: [selectedReward],
  });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      handleAction={action}
      actionText={
        selectedReward.symbol === 'all' ? (
          <Trans>Claim all</Trans>
        ) : (
          <Trans>Claim {selectedReward.symbol}</Trans>
        )
      }
      actionInProgressText={<Trans>Claiming</Trans>}
      isWrongNetwork={isWrongNetwork}
    />
  );
};
