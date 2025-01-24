import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import { Row } from "src/components/primitives/Row";
import { TokenIcon } from "src/components/primitives/TokenIcon";
import { RewardsSelect } from "src/components/transactions/ClaimRewards/RewardsSelect";
import { TxErrorView } from "src/components/transactions/FlowCommons/Error";
import { GasEstimationError } from "src/components/transactions/FlowCommons/GasEstimationError";
import { TxSuccessView } from "src/components/transactions/FlowCommons/Success";
import { DetailsNumberLine, DetailsNumberLineWithSub, TxModalDetails } from "src/components/transactions/FlowCommons/TxModalDetails";
import { TxModalTitle } from "src/components/transactions/FlowCommons/TxModalTitle";
import { ChangeNetworkWarning } from "src/components/transactions/Warnings/ChangeNetworkWarning";
import { Reward } from "src/helpers/types";
import { ExtendedFormattedUser } from "src/hooks/pool/useExtendedUserSummaryAndIncentives";
import { MergedStakeData } from "src/hooks/stake/useUmbrellaSummary";
import { useModalContext } from "src/hooks/useModal";
import { useWeb3Context } from "src/libs/hooks/useWeb3Context";
import { useRootStore } from "src/store/root";
import { getNetworkConfig } from "src/utils/marketsAndNetworksConfig";
import { useShallow } from "zustand/shallow";

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

interface UmbrellaClaimModalContentProps {
  user: ExtendedFormattedUser;
  stakeData: MergedStakeData;
}

export const UmbrellaClaimModalContent = ({ user, stakeData }: UmbrellaClaimModalContentProps) => {
  const { gasLimit, mainTxState: claimRewardsTxState, txError } = useModalContext();
  const [currentChainId, currentMarketData] = useRootStore(
    useShallow((store) => [store.currentChainId, store.currentMarketData])
  );
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const [selectedRewardSymbol, setSelectedRewardSymbol] = useState<string>('all');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [allReward, setAllReward] = useState<Reward>();

  const networkConfig = getNetworkConfig(currentChainId);

  // // get all rewards
  // useEffect(() => {
  //   const userIncentives: Reward[] = [];
  //   let totalClaimableUsd = Number(claimableUsd);
  //   const allAssets: string[] = [];
  //   Object.keys(user.calculatedUserIncentives).forEach((rewardTokenAddress) => {
  //     const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
  //     const rewardBalance = normalize(incentive.claimableRewards, incentive.rewardTokenDecimals);

  //     let tokenPrice = 0;
  //     // getting price from reserves for the native rewards for v2 markets
  //     if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
  //       if (currentMarketData.chainId === ChainId.mainnet) {
  //         const aave = reserves.find((reserve) => reserve.symbol === 'AAVE');
  //         tokenPrice = aave ? Number(aave.priceInUSD) : 0;
  //       } else {
  //         reserves.forEach((reserve) => {
  //           if (reserve.isWrappedBaseAsset) {
  //             tokenPrice = Number(reserve.priceInUSD);
  //           }
  //         });
  //       }
  //     } else {
  //       tokenPrice = Number(incentive.rewardPriceFeed);
  //     }

  //     const rewardBalanceUsd = Number(rewardBalance) * tokenPrice;

  //     if (rewardBalanceUsd > 0) {
  //       incentive.assets.forEach((asset) => {
  //         if (allAssets.indexOf(asset) === -1) {
  //           allAssets.push(asset);
  //         }
  //       });

  //       userIncentives.push({
  //         assets: incentive.assets,
  //         incentiveControllerAddress: incentive.incentiveControllerAddress,
  //         symbol: incentive.rewardTokenSymbol,
  //         balance: rewardBalance,
  //         balanceUsd: rewardBalanceUsd.toString(),
  //         rewardTokenAddress,
  //       });

  //       totalClaimableUsd = totalClaimableUsd + Number(rewardBalanceUsd);
  //     }
  //   });

  //   if (userIncentives.length === 1) {
  //     setSelectedRewardSymbol(userIncentives[0].symbol);
  //   } else if (userIncentives.length > 1 && !selectedReward) {
  //     const allRewards = {
  //       assets: allAssets,
  //       incentiveControllerAddress: userIncentives[0].incentiveControllerAddress,
  //       symbol: 'all',
  //       balance: '0',
  //       balanceUsd: totalClaimableUsd.toString(),
  //       rewardTokenAddress: '',
  //     };
  //     setSelectedRewardSymbol('all');
  //     setAllReward(allRewards);
  //   }

  //   setRewards(userIncentives);
  //   setClaimableUsd(totalClaimableUsd.toString());
  // }, []);

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;
  const selectedReward =
    selectedRewardSymbol === 'all'
      ? allReward
      : rewards.find((r) => r.symbol === selectedRewardSymbol);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (claimRewardsTxState.success)
    return <TxSuccessView action={<Trans>Claimed</Trans>} amount={selectedReward?.balanceUsd} />;

  return (
    <>
      <TxModalTitle title="Claim rewards" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      {rewards.length > 1 && (
        <RewardsSelect
          rewards={rewards}
          selectedReward={selectedRewardSymbol}
          setSelectedReward={setSelectedRewardSymbol}
        />
      )}

      {/* {selectedReward && (
        <TxModalDetails gasLimit={gasLimit}>
          {selectedRewardSymbol === 'all' && (
            <>
              <Row
                caption={<Trans>Balance</Trans>}
                captionVariant="description"
                align="flex-start"
                mb={selectedReward.symbol !== 'all' ? 0 : 4}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {rewards.map((reward) => (
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
              <DetailsNumberLine description={<Trans>Total worth</Trans>} value={claimableUsd} />
            </>
          )}
          {selectedRewardSymbol !== 'all' && (
            <DetailsNumberLineWithSub
              symbol={<TokenIcon symbol={selectedReward.symbol} />}
              futureValue={selectedReward.balance}
              futureValueUSD={selectedReward.balanceUsd}
              description={<Trans>{selectedReward.symbol} Balance</Trans>}
            />
          )}
        </TxModalDetails>
      )} */}

      {txError && <GasEstimationError txError={txError} />}

      {/* <ClaimRewardsActions
        isWrongNetwork={isWrongNetwork}
        selectedReward={selectedReward ?? ({} as Reward)}
        blocked={blockingError !== undefined}
      /> */}
    </>
  );
};
