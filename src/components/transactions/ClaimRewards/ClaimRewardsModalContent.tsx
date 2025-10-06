import { ChainId, ProtocolAction } from '@aave/contract-helpers';
import { normalize, UserIncentiveData } from '@aave/math-utils';
import { chainId, evmAddress, useUserMeritRewards } from '@aave/react';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Reward } from 'src/helpers/types';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { REWARDS } from 'src/utils/events';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsNumberLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { ClaimRewardsActions } from './ClaimRewardsActions';
import { ControllerIdentifier, RewardSymbol } from './constants';
import { RewardsSelect } from './RewardsSelect';

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

interface ClaimRewardsModalContentProps {
  user: ExtendedFormattedUser;
  reserves: ComputedReserveData[];
}

export const ClaimRewardsModalContent = ({ user, reserves }: ClaimRewardsModalContentProps) => {
  const { gasLimit, mainTxState: claimRewardsTxState, txError } = useModalContext();
  const [currentChainId, currentMarketData, trackEvent] = useRootStore(
    useShallow((store) => [store.currentChainId, store.currentMarketData, store.trackEvent])
  );
  const { chainId: connectedChainId, readOnlyModeAddress, currentAccount } = useWeb3Context();
  const [claimableUsd, setClaimableUsd] = useState('0');
  const [selectedRewardSymbol, setSelectedRewardSymbol] = useState<string>(RewardSymbol.ALL);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [allReward, setAllReward] = useState<Reward>();

  const networkConfig = getNetworkConfig(currentChainId);
  const { data: meritClaimRewards } = useUserMeritRewards({
    user: currentAccount
      ? evmAddress(currentAccount)
      : evmAddress('0x0000000000000000000000000000000000000000'),
    chainId: chainId(currentMarketData.chainId),
  });

  const [meritRewardsForSelect, setMeritRewardsForSelect] = useState<Reward[]>([]);
  const [meritAllReward, setMeritAllReward] = useState<Reward>();
  const [protocolAllReward, setProtocolAllReward] = useState<Reward>();

  useEffect(() => {
    const protocolRewards: Reward[] = [];
    const meritRewards: Reward[] = [];
    let totalProtocolUsd = 0;
    let totalMeritUsd = 0;
    const allAssets: string[] = [];

    Object.keys(user.calculatedUserIncentives).forEach((rewardTokenAddress) => {
      const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
      const rewardBalance = normalize(incentive.claimableRewards, incentive.rewardTokenDecimals);

      let tokenPrice = 0;
      if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
        if (currentMarketData.chainId === ChainId.mainnet) {
          const aave = reserves.find((reserve) => reserve.symbol === 'AAVE');
          tokenPrice = aave ? Number(aave.priceInUSD) : 0;
        } else {
          reserves.forEach((reserve) => {
            if (reserve.isWrappedBaseAsset) {
              tokenPrice = Number(reserve.priceInUSD);
            }
          });
        }
      } else {
        tokenPrice = Number(incentive.rewardPriceFeed);
      }

      const rewardBalanceUsd = Number(rewardBalance) * tokenPrice;

      if (rewardBalanceUsd > 0) {
        incentive.assets.forEach((asset) => {
          if (allAssets.indexOf(asset) === -1) {
            allAssets.push(asset);
          }
        });

        protocolRewards.push({
          assets: incentive.assets,
          incentiveControllerAddress: incentive.incentiveControllerAddress,
          symbol: incentive.rewardTokenSymbol,
          balance: rewardBalance,
          balanceUsd: rewardBalanceUsd.toString(),
          rewardTokenAddress,
        });

        totalProtocolUsd += rewardBalanceUsd;
      }
    });

    // Process merit rewards (can only be claimed all together)
    if (meritClaimRewards?.claimable) {
      meritClaimRewards.claimable.forEach((meritReward) => {
        const meritRewardUsd = Number(meritReward.amount.usd || 0);

        if (meritRewardUsd > 0) {
          // Add merit reward asset to allAssets if not already included
          if (allAssets.indexOf(meritReward.currency.symbol) === -1) {
            allAssets.push(meritReward.currency.symbol);
          }

          meritRewards.push({
            assets: [], // Merit rewards don't have associated lending assets
            incentiveControllerAddress: ControllerIdentifier.MERIT_REWARD, // Special identifier for merit rewards handled in actions
            symbol: meritReward.currency.symbol,
            balance: meritReward.amount.amount.value,
            balanceUsd: meritReward.amount.usd,
            rewardTokenAddress: meritReward.currency.address,
          });

          totalMeritUsd += meritRewardUsd;
        }
      });
    }

    const totalClaimableUsd = totalProtocolUsd + totalMeritUsd;

    const hasProtocolRewards = protocolRewards.length > 0;
    const hasMeritRewards = meritRewards.length > 0;

    // Store merit rewards for the select component
    setMeritRewardsForSelect(meritRewards);

    // Always create merit-all option when merit rewards exist
    if (hasMeritRewards) {
      const meritAllOption = {
        assets: allAssets.filter((asset) => meritRewards.some((mr) => mr.assets.includes(asset))),
        incentiveControllerAddress: ControllerIdentifier.MERIT_REWARD,
        symbol: RewardSymbol.MERIT_ALL,
        balance: '0',
        balanceUsd: totalMeritUsd.toString(),
        rewardTokenAddress: '',
      };
      setMeritAllReward(meritAllOption);
    }

    // Always create protocol-all option when protocol rewards exist
    if (hasProtocolRewards) {
      const protocolAllOption = {
        assets: allAssets.filter((asset) =>
          protocolRewards.some((pr) => pr.assets.includes(asset))
        ),
        incentiveControllerAddress: hasProtocolRewards
          ? protocolRewards[0].incentiveControllerAddress
          : '',
        symbol: RewardSymbol.PROTOCOL_ALL,
        balance: '0',
        balanceUsd: totalProtocolUsd.toString(),
        rewardTokenAddress: '',
      };
      setProtocolAllReward(protocolAllOption);
    }

    if (hasProtocolRewards && hasMeritRewards) {
      // Both types of rewards - always default to 'all'
      const allRewardsOption = {
        assets: allAssets,
        incentiveControllerAddress: protocolRewards[0].incentiveControllerAddress,
        symbol: RewardSymbol.ALL,
        balance: '0',
        balanceUsd: totalClaimableUsd.toString(),
        rewardTokenAddress: '',
      };

      setSelectedRewardSymbol(RewardSymbol.ALL);
      setAllReward(allRewardsOption);
    } else if (hasProtocolRewards && !hasMeritRewards) {
      // Only protocol rewards
      if (protocolRewards.length === 1) {
        // Single protocol reward - no selector needed
        setSelectedRewardSymbol(protocolRewards[0].symbol);
      } else {
        // Multiple protocol rewards - show selector with 'protocol-all' as default
        const protocolAllOption = {
          assets: allAssets,
          incentiveControllerAddress: protocolRewards[0].incentiveControllerAddress,
          symbol: RewardSymbol.PROTOCOL_ALL,
          balance: '0',
          balanceUsd: totalProtocolUsd.toString(),
          rewardTokenAddress: '',
        };

        setSelectedRewardSymbol(RewardSymbol.PROTOCOL_ALL);
        setAllReward(protocolAllOption);
      }
    } else if (!hasProtocolRewards && hasMeritRewards) {
      // Only merit rewards - default to merit-all
      const meritAllOption = {
        assets: allAssets,
        incentiveControllerAddress: ControllerIdentifier.MERIT_REWARD,
        symbol: RewardSymbol.MERIT_ALL,
        balance: '0',
        balanceUsd: totalMeritUsd.toString(),
        rewardTokenAddress: '',
      };

      setSelectedRewardSymbol(RewardSymbol.MERIT_ALL);
      setAllReward(meritAllOption);
    }

    // Show protocol rewards in the rewards list for individual selection
    setRewards(protocolRewards);
    setClaimableUsd(totalClaimableUsd.toString());
  }, [
    meritClaimRewards,
    user.calculatedUserIncentives,
    currentMarketData.v3,
    currentMarketData.chainId,
    reserves,
  ]);

  // error handling
  let blockingError: ErrorType | undefined = undefined;
  if (claimableUsd === '0') {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  // error handling render
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>You have no rewards to claim at this time.</Trans>;
      default:
        return null;
    }
  };

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;
  const selectedReward =
    selectedRewardSymbol === RewardSymbol.ALL
      ? allReward
      : selectedRewardSymbol === RewardSymbol.MERIT_ALL ||
        selectedRewardSymbol.startsWith('merit-display-')
      ? meritAllReward
      : selectedRewardSymbol === RewardSymbol.PROTOCOL_ALL
      ? protocolAllReward
      : rewards.find((r) => r.symbol === selectedRewardSymbol) ||
        meritRewardsForSelect.find((r) => r.symbol === selectedRewardSymbol);

  // Track analytics when claim transaction succeeds
  const hasTrackedRef = useRef(false);

  // Reset tracking flag when starting a new transaction
  useEffect(() => {
    if (!claimRewardsTxState.success) {
      hasTrackedRef.current = false;
    }
  }, [claimRewardsTxState.success]);

  useEffect(() => {
    if (claimRewardsTxState.success && selectedReward && !hasTrackedRef.current) {
      hasTrackedRef.current = true;

      const networkConfig = getNetworkConfig(currentChainId);

      let eventName: string;
      const baseEventProps = {
        chainId: currentChainId,
        chainName: networkConfig.displayName || networkConfig.name,
        totalClaimableUsd: claimableUsd,
        txHash: claimRewardsTxState.txHash,
        market: currentMarketData.market,
        transactiontype: ProtocolAction.claimRewards,
      };

      // Determine event type and specific properties based on claim type
      if (selectedRewardSymbol === RewardSymbol.ALL) {
        eventName = REWARDS.CLAIM_ALL_REWARDS;
        const protocolRewardsCount = rewards.length;
        const meritRewardsCount = meritClaimRewards?.claimable?.length || 0;

        trackEvent(eventName, {
          ...baseEventProps,
          claimType: 'all',
          protocolRewardsCount,
          meritRewardsCount,
          totalRewardsCount: protocolRewardsCount + meritRewardsCount,
        });
      } else if (
        selectedRewardSymbol === RewardSymbol.MERIT_ALL ||
        selectedRewardSymbol.startsWith('merit-display-')
      ) {
        eventName = REWARDS.CLAIM_MERIT_REWARDS;

        trackEvent(eventName, {
          ...baseEventProps,
          claimType: 'merit-all',
          meritRewardsCount: meritClaimRewards?.claimable?.length || 0,
          claimableUsd: selectedReward.balanceUsd,
        });
      } else if (selectedRewardSymbol === RewardSymbol.PROTOCOL_ALL) {
        eventName = REWARDS.CLAIM_PROTOCOL_REWARDS;

        trackEvent(eventName, {
          ...baseEventProps,
          claimType: 'protocol-all',
          protocolRewardsCount: rewards.length,
          claimableUsd: selectedReward.balanceUsd,
        });
      } else {
        eventName = REWARDS.CLAIM_INDIVIDUAL_REWARD;

        trackEvent(eventName, {
          ...baseEventProps,
          claimType: 'individual',
          rewardSymbol: selectedReward.symbol,
          rewardBalance: selectedReward.balance,
          claimableUsd: selectedReward.balanceUsd,
          rewardTokenAddress: selectedReward.rewardTokenAddress,
        });
      }
    }
  }, [claimRewardsTxState.success]);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (claimRewardsTxState.success)
    return <TxSuccessView action={<Trans>Claimed</Trans>} amount={selectedReward?.balanceUsd} />;

  return (
    <>
      <TxModalTitle title="Claim rewards" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          autoSwitchOnMount={true}
          networkName={networkConfig.name}
          chainId={currentChainId}
        />
      )}

      {meritClaimRewards?.claimable && meritClaimRewards.claimable.length > 0 && (
        <Typography variant="description" color="text.secondary" sx={{ mb: 2 }}>
          {selectedRewardSymbol === RewardSymbol.ALL ? (
            <Trans>Claiming all protocol rewards and merit rewards together</Trans>
          ) : selectedRewardSymbol === RewardSymbol.MERIT_ALL ||
            selectedRewardSymbol.startsWith('merit-display-') ? (
            <Trans>Claiming all merit rewards only</Trans>
          ) : selectedRewardSymbol === RewardSymbol.PROTOCOL_ALL ? (
            <Trans>
              Claiming all protocol rewards only. Merit rewards excluded - select &quot;claim
              all&quot; to include merit rewards.
            </Trans>
          ) : (
            <Trans>
              Claiming individual protocol reward only. Merit rewards excluded - select &quot;claim
              all&quot; to include merit rewards.
            </Trans>
          )}
        </Typography>
      )}

      {blockingError !== undefined && <Typography>{handleBlocked()}</Typography>}

      {(rewards.length > 1 ||
        (rewards.length >= 1 &&
          meritClaimRewards?.claimable &&
          meritClaimRewards.claimable.length > 0)) && (
        <RewardsSelect
          rewards={rewards}
          meritRewards={meritRewardsForSelect}
          selectedReward={selectedRewardSymbol}
          setSelectedReward={setSelectedRewardSymbol}
        />
      )}

      {selectedReward && (
        <TxModalDetails gasLimit={gasLimit}>
          {selectedRewardSymbol === RewardSymbol.ALL && (
            <>
              {rewards.length > 0 && (
                <Row
                  caption={<Trans>Protocol Rewards</Trans>}
                  captionVariant="description"
                  align="flex-start"
                  mb={4}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {rewards.map((reward) => (
                      <Box
                        key={`claim-protocol-${reward.symbol}`}
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
              )}

              {meritClaimRewards?.claimable && meritClaimRewards.claimable.length > 0 && (
                <Row
                  caption={<Trans>Merit Rewards</Trans>}
                  captionVariant="description"
                  align="flex-start"
                  mb={4}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {meritClaimRewards.claimable.map((meritReward) => (
                      <Box
                        key={`claim-merit-${meritReward.currency.symbol}`}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          mb: 4,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TokenIcon
                            symbol={meritReward.currency.symbol}
                            sx={{ mr: 1, fontSize: '16px' }}
                          />
                          <FormattedNumber
                            value={Number(meritReward.amount.amount.value)}
                            variant="secondary14"
                          />
                          <Typography ml={1} variant="secondary14">
                            {meritReward.currency.symbol}
                          </Typography>
                          <Typography
                            ml={1}
                            variant="caption"
                            color="primary.main"
                            sx={{ fontSize: '10px' }}
                          >
                            MERIT
                          </Typography>
                        </Box>
                        <FormattedNumber
                          value={Number(meritReward.amount.usd)}
                          variant="helperText"
                          compact
                          symbol="USD"
                          color="text.secondary"
                        />
                      </Box>
                    ))}
                  </Box>
                </Row>
              )}

              <DetailsNumberLine description={<Trans>Total worth</Trans>} value={claimableUsd} />
            </>
          )}

          {selectedRewardSymbol === RewardSymbol.MERIT_ALL && (
            <>
              <Row
                caption={<Trans>Merit Rewards</Trans>}
                captionVariant="description"
                align="flex-start"
                mb={4}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {meritRewardsForSelect.map((meritReward) => (
                    <Box
                      key={`claim-merit-all-${meritReward.symbol}`}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        mb: 4,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TokenIcon symbol={meritReward.symbol} sx={{ mr: 1, fontSize: '16px' }} />
                        <FormattedNumber
                          value={Number(meritReward.balance)}
                          variant="secondary14"
                        />
                        <Typography ml={1} variant="secondary14">
                          {meritReward.symbol}
                        </Typography>
                        <Typography
                          ml={1}
                          variant="caption"
                          color="primary.main"
                          sx={{ fontSize: '10px' }}
                        >
                          MERIT
                        </Typography>
                      </Box>
                      <FormattedNumber
                        value={Number(meritReward.balanceUsd)}
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
                description={<Trans>Total worth</Trans>}
                value={meritAllReward?.balanceUsd || '0'}
              />
            </>
          )}

          {selectedRewardSymbol === RewardSymbol.PROTOCOL_ALL && (
            <>
              <Row
                caption={<Trans>Protocol Rewards</Trans>}
                captionVariant="description"
                align="flex-start"
                mb={4}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {rewards.map((reward) => (
                    <Box
                      key={`claim-protocol-all-${reward.symbol}`}
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
                description={<Trans>Total worth</Trans>}
                value={protocolAllReward?.balanceUsd || '0'}
              />
            </>
          )}

          {selectedRewardSymbol !== RewardSymbol.ALL &&
            selectedRewardSymbol !== RewardSymbol.MERIT_ALL &&
            !selectedRewardSymbol.startsWith('merit-display-') &&
            selectedRewardSymbol !== RewardSymbol.PROTOCOL_ALL && (
              <DetailsNumberLineWithSub
                symbol={<TokenIcon symbol={selectedReward.symbol} />}
                futureValue={selectedReward.balance}
                futureValueUSD={selectedReward.balanceUsd}
                description={
                  <Trans>
                    {selectedReward.symbol} Balance
                    {!rewards.find((r) => r.symbol === selectedReward.symbol) &&
                    meritRewardsForSelect.find((r) => r.symbol === selectedReward.symbol)
                      ? ' (Merit)'
                      : ''}
                  </Trans>
                }
              />
            )}
        </TxModalDetails>
      )}

      {txError && <GasEstimationError txError={txError} />}

      <ClaimRewardsActions
        isWrongNetwork={isWrongNetwork}
        selectedReward={selectedReward ?? ({} as Reward)}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
