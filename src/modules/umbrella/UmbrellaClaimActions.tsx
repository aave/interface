import {
  gasLimitRecommendations,
  ProtocolAction,
  RewardsDistributorService,
} from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { PopulatedTransaction } from 'ethers';
import { useEffect } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { stakeUmbrellaConfig } from 'src/services/UmbrellaStakeDataService';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';

import { UmbrellaRewards } from './UmbrellaClaimModalContent';

export interface StakeRewardClaimActionProps extends BoxProps {
  stakeTokens: string[];
  rewardsToClaim: UmbrellaRewards[];
  isWrongNetwork: boolean;
}

export const UmbrellaClaimActions = ({
  stakeTokens,
  rewardsToClaim,
  isWrongNetwork,
  ...props
}: StakeRewardClaimActionProps) => {
  const queryClient = useQueryClient();
  const { loadingTxns, mainTxState, setMainTxState, setTxError, setGasLimit } = useModalContext();

  const estimateGasLimit = useRootStore((store) => store.estimateGasLimit);
  const { sendTx } = useWeb3Context();
  const [user, currentMarket] = useRootStore(
    useShallow((store) => [store.account, store.currentMarket])
  );

  // Validate that we have the required configuration for the current market
  const stakeRewardsControllerAddress = stakeUmbrellaConfig[currentMarket]?.stakeRewardsController;
  const hasValidRewardsController =
    stakeRewardsControllerAddress && stakeRewardsControllerAddress !== '';

  // If no valid rewards controller, this market is not supported for umbrella claiming
  if (!hasValidRewardsController) {
    console.error(`Umbrella reward claiming not supported for market: ${currentMarket}`);
    // You might want to show an error message to the user here
  }

  useEffect(() => {
    let claimGasLimit = Number(
      gasLimitRecommendations[ProtocolAction.umbrellaClaimSelectedRewards].recommended
    );
    if (rewardsToClaim.length > 1) {
      claimGasLimit = Number(
        gasLimitRecommendations[ProtocolAction.umbrellaClaimAllRewards].recommended
      );
    }
    setGasLimit(claimGasLimit.toString());
  }, [rewardsToClaim, setGasLimit]);

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      if (!hasValidRewardsController) {
        throw new Error(`Umbrella reward claiming not supported for market: ${currentMarket}`);
      }

      const rewardsDistributorService = new RewardsDistributorService(
        stakeRewardsControllerAddress
      );
      let claimTx: PopulatedTransaction = {};
      if (stakeTokens.length > 1) {
        claimTx = rewardsDistributorService.claimAllAvailableRewards({
          stakeTokens,
          sender: user,
        });
      } else {
        if (rewardsToClaim.length > 1) {
          claimTx = rewardsDistributorService.claimAllRewards({
            sender: user,
            stakeToken: stakeTokens[0],
          });
        } else {
          claimTx = rewardsDistributorService.claimSelectedRewards({
            sender: user,
            stakeToken: stakeTokens[0],
            rewards: rewardsToClaim.map((reward) => reward.address),
          });
        }
      }
      claimTx = await estimateGasLimit(claimTx);
      const claimTxReceipt = await sendTx(claimTx);
      await claimTxReceipt.wait(1);
      setMainTxState({
        txHash: claimTxReceipt.hash,
        loading: false,
        success: true,
      });

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.umbrella });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  return (
    <TxActionsWrapper
      requiresApproval={false}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<Trans>Claim</Trans>}
      actionInProgressText={<Trans>Claiming</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      {...props}
    />
  );
};
