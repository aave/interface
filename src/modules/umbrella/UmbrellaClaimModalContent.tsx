import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import {
  RewardSelect,
  RewardsSelect,
} from 'src/components/transactions/ClaimRewards/RewardsSelect';
import { TxErrorView } from 'src/components/transactions/FlowCommons/Error';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import {
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { TxModalTitle } from 'src/components/transactions/FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from 'src/components/transactions/Warnings/ChangeNetworkWarning';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { UmbrellaClaimActions } from './UmbrellaClaimActions';

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

interface UmbrellaClaimAllModalContentProps {
  stakeData: MergedStakeData[];
}

interface UmbrellaClaimModalContentProps {
  user: ExtendedFormattedUser;
  stakeData: MergedStakeData;
}

export interface UmbrellaRewards extends RewardSelect {
  balance: string;
  address: string;
}

const stakeDataToRewards = (stakeData: MergedStakeData): UmbrellaRewards[] => {
  return stakeData.formattedRewards.map((reward) => {
    return {
      symbol: reward.rewardTokenSymbol,
      balanceUsd: reward.accruedUsd,
      balance: reward.accrued,
      address: reward.rewardToken,
    };
  });
};

const aggregatedRewards = (data: UmbrellaRewards[]): UmbrellaRewards[] => {
  const resultMap = new Map<string, UmbrellaRewards>();

  for (const item of data) {
    const balance = parseFloat(item.balance);
    if (balance === 0) continue;

    const existing = resultMap.get(item.address);
    if (existing) {
      // Aggregate balances and balanceUsd
      existing.balance = (parseFloat(existing.balance) + balance).toString();
      existing.balanceUsd = (
        parseFloat(existing.balanceUsd) + parseFloat(item.balanceUsd)
      ).toString();
    } else {
      resultMap.set(item.address, { ...item });
    }
  }

  return Array.from(resultMap.values());
};

export const UmbrellaClaimAllModalContent = ({ stakeData }: UmbrellaClaimAllModalContentProps) => {
  const { gasLimit, mainTxState: claimRewardsTxState, txError } = useModalContext();
  const { readOnlyModeAddress } = useWeb3Context();

  const { isWrongNetwork, requiredChainId } = useIsWrongNetwork();

  const networkConfig = getNetworkConfig(requiredChainId);

  const rewards = stakeData.map(stakeDataToRewards).flat();

  const aggregated = aggregatedRewards(rewards);

  const totalClaimableAmount = aggregated.reduce(
    (acc, reward) => acc + Number(reward.balanceUsd),
    0
  );

  const stakeTokens = stakeData.map((data) => data.tokenAddress);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (claimRewardsTxState.success)
    return (
      <TxSuccessView action={<Trans>Claimed</Trans>} amount={totalClaimableAmount.toString()} />
    );

  return (
    <>
      <TxModalTitle title="Claim rewards" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={requiredChainId} />
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <Row caption={<Trans>Amount</Trans>} captionVariant="description" align="flex-start" mb={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {aggregated.map((reward) => (
              <Box
                key={`claim-${reward.symbol}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  mb: 4,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TokenIcon symbol={reward.symbol} sx={{ mr: 1, fontSize: '16px' }} />
                  <FormattedNumber value={Number(reward.balance)} variant="secondary14" />
                  <Typography ml={1} variant="secondary14">
                    {reward.symbol}
                  </Typography>
                </Box>
                <FormattedNumber
                  value={Number(reward.balanceUsd)}
                  variant="helperText"
                  compact
                  symbol="USD"
                  color="text.secondary"
                />
              </Box>
            ))}
          </Box>
        </Row>
        <DetailsNumberLine
          description={<Trans>Total</Trans>}
          value={totalClaimableAmount.toString()}
          symbol="USD"
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <UmbrellaClaimActions
        stakeTokens={stakeTokens}
        isWrongNetwork={isWrongNetwork}
        rewardsToClaim={[]}
      />
    </>
  );
};

export const UmbrellaClaimModalContent = ({ stakeData }: UmbrellaClaimModalContentProps) => {
  const { gasLimit, mainTxState: claimRewardsTxState, txError } = useModalContext();
  const { readOnlyModeAddress } = useWeb3Context();
  const [selectedRewardSymbol, setSelectedRewardSymbol] = useState<string>('all');

  const rewards = stakeDataToRewards(stakeData);

  const isMultiReward = rewards.length > 1;

  const { isWrongNetwork, requiredChainId } = useIsWrongNetwork();

  const networkConfig = getNetworkConfig(requiredChainId);

  const selectedReward =
    selectedRewardSymbol === 'all'
      ? rewards
      : rewards.filter((r) => r.symbol === selectedRewardSymbol);

  const selectedRewardClaimableBalance = selectedReward.reduce(
    (acc, reward) => acc + Number(reward.balanceUsd),
    0
  );

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (claimRewardsTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Claimed</Trans>}
        amount={selectedRewardClaimableBalance.toString()}
      />
    );

  return (
    <>
      <TxModalTitle title="Claim rewards" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={requiredChainId} />
      )}

      {isMultiReward && (
        <RewardsSelect
          rewards={rewards}
          selectedReward={selectedRewardSymbol}
          setSelectedReward={setSelectedRewardSymbol}
        />
      )}
      <TxModalDetails gasLimit={gasLimit}>
        <Row caption={<Trans>Amount</Trans>} captionVariant="description" align="flex-start" mb={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {selectedReward.map((reward) => (
              <Box
                key={`claim-${reward.symbol}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  mb: 4,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TokenIcon symbol={reward.symbol} sx={{ mr: 1, fontSize: '16px' }} />
                  <FormattedNumber value={Number(reward.balance)} variant="secondary14" />
                  <Typography ml={1} variant="secondary14">
                    {reward.symbol}
                  </Typography>
                </Box>
                <FormattedNumber
                  value={Number(reward.balanceUsd)}
                  variant="helperText"
                  compact
                  symbol="USD"
                  color="text.secondary"
                />
              </Box>
            ))}
          </Box>
        </Row>
        <DetailsNumberLine
          description={<Trans>Total</Trans>}
          value={selectedRewardClaimableBalance.toString()}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <UmbrellaClaimActions
        stakeTokens={[stakeData.tokenAddress]}
        isWrongNetwork={isWrongNetwork}
        rewardsToClaim={selectedReward}
      />
    </>
  );
};
