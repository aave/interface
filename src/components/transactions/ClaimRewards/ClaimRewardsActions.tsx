import { Trans } from '@lingui/macro';
import { Reward } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
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
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loadingTxns, mainTxState } = useTransactionHandler({
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
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: Object.keys(selectedReward).length === 0 || blocked,
    deps: [selectedReward],
  });

  return (
    <TxActionsWrapper
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
      helperText={
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="borrow"
        />
      }
    />
  );
};
