import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { BigNumber } from "ethers";
import { useState } from "react";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import { Row } from "src/components/primitives/Row";
import { TokenIcon } from "src/components/primitives/TokenIcon";
import { RewardSelect, RewardsSelect } from "src/components/transactions/ClaimRewards/RewardsSelect";
import { TxErrorView } from "src/components/transactions/FlowCommons/Error";
import { GasEstimationError } from "src/components/transactions/FlowCommons/GasEstimationError";
import { TxSuccessView } from "src/components/transactions/FlowCommons/Success";
import { DetailsNumberLine, TxModalDetails } from "src/components/transactions/FlowCommons/TxModalDetails";
import { TxModalTitle } from "src/components/transactions/FlowCommons/TxModalTitle";
import { ChangeNetworkWarning } from "src/components/transactions/Warnings/ChangeNetworkWarning";
import { ExtendedFormattedUser } from "src/hooks/pool/useExtendedUserSummaryAndIncentives";
import { MergedStakeData } from "src/hooks/stake/useUmbrellaSummary";
import { useIsWrongNetwork } from "src/hooks/useIsWrongNetwork";
import { useModalContext } from "src/hooks/useModal";
import { useWeb3Context } from "src/libs/hooks/useWeb3Context";
import { getNetworkConfig } from "src/utils/marketsAndNetworksConfig";
import { UmbrellaClaimActions } from "./UmbrellaClaimActions";

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
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
      balanceUsd: '1',
      balance: reward.accrued,
      address: reward.rewardToken,
    }
  });
};

export const UmbrellaClaimModalContent = ({ user, stakeData }: UmbrellaClaimModalContentProps) => {
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
    
  const selectedRewardClaimableBalance = selectedReward.reduce((acc, reward) => acc.add(BigNumber.from(reward.balanceUsd)), BigNumber.from('0'));

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (claimRewardsTxState.success)
    return <TxSuccessView action={<Trans>Claimed</Trans>} amount={selectedRewardClaimableBalance.toString()} />;

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
              <Row
                caption={<Trans>Balance</Trans>}
                captionVariant="description"
                align="flex-start"
                mb={4}
              >
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
              <DetailsNumberLine description={<Trans>Total worth</Trans>} value={selectedRewardClaimableBalance.toString()} />
        </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <UmbrellaClaimActions
        stakeData={stakeData}
        isWrongNetwork={isWrongNetwork}
        rewardsToClaim={selectedReward}
      />
    </>
  );
};
