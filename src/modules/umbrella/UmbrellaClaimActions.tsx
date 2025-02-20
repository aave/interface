import { RewardsDistributorService } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { PopulatedTransaction } from 'ethers';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { stakeUmbrellaConfig } from 'src/services/UmbrellaStakeDataService';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { UmbrellaRewards } from './UmbrellaClaimModalContent';

export interface StakeRewardClaimActionProps extends BoxProps {
  stakeData: MergedStakeData;
  rewardsToClaim: UmbrellaRewards[];
  isWrongNetwork: boolean;
}

export const UmbrellaClaimActions = ({
  stakeData,
  rewardsToClaim,
  isWrongNetwork,
  ...props
}: StakeRewardClaimActionProps) => {
  const { loadingTxns, mainTxState, setMainTxState, setTxError } = useModalContext();

  const estimateGasLimit = useRootStore((store) => store.estimateGasLimit);
  const { sendTx } = useWeb3Context();
  const [currentChainId, user] = useRootStore(
    useShallow((store) => [store.currentChainId, store.account])
  );

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const rewardsDistributorService = new RewardsDistributorService(
        stakeUmbrellaConfig[currentChainId].stakeRewardsController
      );
      let claimTx: PopulatedTransaction = {};
      if (rewardsToClaim.length > 1) {
        claimTx = rewardsDistributorService.claimAllRewards({
          sender: user,
          stakeToken: stakeData.tokenAddress,
        });
      } else {
        claimTx = rewardsDistributorService.claimSelectedRewards({
          sender: user,
          stakeToken: stakeData.tokenAddress,
          rewards: rewardsToClaim.map((reward) => reward.address),
        });
      }
      claimTx = await estimateGasLimit(claimTx);
      const claimTxReceipt = await sendTx(claimTx);
      await claimTxReceipt.wait(1);
      setMainTxState({
        txHash: claimTxReceipt.hash,
        loading: false,
        success: true,
      });
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
