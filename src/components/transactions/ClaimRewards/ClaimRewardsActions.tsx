import { Trans } from '@lingui/macro';
import { Reward } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
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
  const { reserves } = useAppDataContext();

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      if (currentMarketData.v3) {
        const allReserves: string[] = [];
        reserves.forEach((reserve) => {
          if (reserve.aIncentivesData && reserve.aIncentivesData.length > 0) {
            allReserves.push(reserve.aTokenAddress);
          }
          if (reserve.vIncentivesData && reserve.vIncentivesData.length > 0) {
            allReserves.push(reserve.variableDebtTokenAddress);
          }
          if (reserve.sIncentivesData && reserve.sIncentivesData.length > 0) {
            allReserves.push(reserve.stableDebtTokenAddress);
          }
        });

        if (selectedReward.symbol === 'all') {
          return incentivesTxBuilderV2.claimAllRewards({
            user: currentAccount,
            assets: allReserves,
            to: currentAccount,
            incentivesControllerAddress: selectedReward.incentiveControllerAddress,
          });
        } else {
          return incentivesTxBuilderV2.claimRewards({
            user: currentAccount,
            assets: allReserves,
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
