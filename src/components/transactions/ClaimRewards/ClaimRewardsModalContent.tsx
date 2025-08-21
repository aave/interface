import { ChainId } from '@aave/contract-helpers';
import { normalize, UserIncentiveData } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
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
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

import { useMeritClaimRewards } from '@aave/react';

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
  const [currentChainId, currentMarketData] = useRootStore(
    useShallow((store) => [store.currentChainId, store.currentMarketData])
  );
  const { chainId: connectedChainId, readOnlyModeAddress, currentAccount } = useWeb3Context();
  const [claimableUsd, setClaimableUsd] = useState('0');
  const [selectedRewardSymbol, setSelectedRewardSymbol] = useState<string>('all');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [allReward, setAllReward] = useState<Reward>();

  const networkConfig = getNetworkConfig(currentChainId);
  const { data: meritClaimRewards } = useMeritClaimRewards({ user: currentAccount, chainId: currentMarketData.chainId });

  // Store merit rewards for RewardsSelect component
  const [meritRewardsForSelect, setMeritRewardsForSelect] = useState<Reward[]>([]);
  // Store merit-all option separately
  const [meritAllReward, setMeritAllReward] = useState<Reward>();
  // Store protocol-all option separately
  const [protocolAllReward, setProtocolAllReward] = useState<Reward>();

  // get all rewards
  useEffect(() => {
    const protocolRewards: Reward[] = [];
    const meritRewards: Reward[] = [];
    let totalProtocolUsd = 0;
    let totalMeritUsd = 0;
    const allAssets: string[] = [];

    // Process existing user incentives (protocol rewards)
    Object.keys(user.calculatedUserIncentives).forEach((rewardTokenAddress) => {
      const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
      const rewardBalance = normalize(incentive.claimableRewards, incentive.rewardTokenDecimals);

      let tokenPrice = 0;
      // getting price from reserves for the native rewards for v2 markets
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
    if (meritClaimRewards?.rewards) {
      meritClaimRewards.rewards.forEach((meritReward) => {
        const meritRewardUsd = Number(meritReward.amount.usd || 0);

        if (meritRewardUsd > 0) {
          // Add merit reward asset to allAssets if not already included
          if (allAssets.indexOf(meritReward.currency.symbol) === -1) {
            allAssets.push(meritReward.currency.symbol);
          }

          meritRewards.push({
            assets: [], // Merit rewards don't have associated lending assets
            incentiveControllerAddress: 'MERIT_REWARD', // Special identifier for merit rewards
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

    // Set up selection logic
    const hasProtocolRewards = protocolRewards.length > 0;
    const hasMeritRewards = meritRewards.length > 0;

    // Store merit rewards for the select component
    setMeritRewardsForSelect(meritRewards);

    // Always create merit-all option when merit rewards exist
    if (hasMeritRewards) {
      const meritAllOption = {
        assets: allAssets.filter(asset => meritRewards.some(mr => mr.assets.includes(asset))),
        incentiveControllerAddress: 'MERIT_REWARD',
        symbol: 'merit-all',
        balance: '0',
        balanceUsd: totalMeritUsd.toString(),
        rewardTokenAddress: '',
      };
      setMeritAllReward(meritAllOption);
    }

    // Always create protocol-all option when protocol rewards exist
    if (hasProtocolRewards) {
      const protocolAllOption = {
        assets: allAssets.filter(asset => protocolRewards.some(pr => pr.assets.includes(asset))),
        incentiveControllerAddress: hasProtocolRewards ? protocolRewards[0].incentiveControllerAddress : '',
        symbol: 'protocol-all',
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
        symbol: 'all',
        balance: '0',
        balanceUsd: totalClaimableUsd.toString(),
        rewardTokenAddress: '',
      };

      setSelectedRewardSymbol('all');
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
          symbol: 'protocol-all',
          balance: '0',
          balanceUsd: totalProtocolUsd.toString(),
          rewardTokenAddress: '',
        };

        setSelectedRewardSymbol('protocol-all');
        setAllReward(protocolAllOption);
      }
    } else if (!hasProtocolRewards && hasMeritRewards) {
      // Only merit rewards - default to merit-all
      const meritAllOption = {
        assets: allAssets,
        incentiveControllerAddress: 'MERIT_REWARD',
        symbol: 'merit-all',
        balance: '0',
        balanceUsd: totalMeritUsd.toString(),
        rewardTokenAddress: '',
      };

      setSelectedRewardSymbol('merit-all');
      setAllReward(meritAllOption);
    }

    // Show protocol rewards in the rewards list for individual selection
    setRewards(protocolRewards);
    setClaimableUsd(totalClaimableUsd.toString());
  }, [meritClaimRewards, user.calculatedUserIncentives, currentMarketData.v3, currentMarketData.chainId, reserves]);

  // error handling
  let blockingError: ErrorType | undefined = undefined;
  if (claimableUsd === '0') {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  // error handling render
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Your reward balance is 0</Trans>;
      default:
        return null;
    }
  };

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;
  const selectedReward =
    selectedRewardSymbol === 'all'
      ? allReward
      : selectedRewardSymbol === 'merit-all'
        ? meritAllReward
        : selectedRewardSymbol === 'protocol-all'
          ? protocolAllReward
          : rewards.find((r) => r.symbol === selectedRewardSymbol) ||
          meritRewardsForSelect.find((r) => r.symbol === selectedRewardSymbol);

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

      {meritClaimRewards?.rewards && meritClaimRewards.rewards.length > 0 && (
        <Typography variant="description" color="text.secondary" sx={{ mb: 2 }}>
          {selectedRewardSymbol === 'all' ? (
            <Trans>Claiming all protocol rewards and merit rewards together</Trans>
          ) : selectedRewardSymbol === 'merit-all' ? (
            <Trans>Claiming all merit rewards only</Trans>
          ) : selectedRewardSymbol === 'protocol-all' ? (
            <Trans>Claiming all protocol rewards only. Merit rewards excluded - select "claim all" to include merit rewards.</Trans>
          ) : meritRewardsForSelect.some(r => r.symbol === selectedRewardSymbol) ? (
            <Trans>Claiming individual merit reward only</Trans>
          ) : (
            <Trans>Claiming individual protocol reward only. Merit rewards excluded - select "claim all" to include merit rewards.</Trans>
          )}
        </Typography>
      )}

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}

      {(rewards.length > 1 || (rewards.length >= 1 && meritClaimRewards?.rewards && meritClaimRewards.rewards.length > 0)) && (
        <RewardsSelect
          rewards={rewards}
          meritRewards={meritRewardsForSelect}
          selectedReward={selectedRewardSymbol}
          setSelectedReward={setSelectedRewardSymbol}
        />
      )}

      {selectedReward && (
        <TxModalDetails gasLimit={gasLimit}>
          {selectedRewardSymbol === 'all' && (
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

              {meritClaimRewards?.rewards && meritClaimRewards.rewards.length > 0 && (
                <Row
                  caption={<Trans>Merit Rewards</Trans>}
                  captionVariant="description"
                  align="flex-start"
                  mb={4}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {meritClaimRewards.rewards.map((meritReward) => (
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
                          <TokenIcon symbol={meritReward.currency.symbol} sx={{ mr: 1, fontSize: '16px' }} />
                          <FormattedNumber value={Number(meritReward.amount.amount.value)} variant="secondary14" />
                          <Typography ml={1} variant="secondary14">
                            {meritReward.currency.symbol}
                          </Typography>
                          <Typography ml={1} variant="caption" color="primary.main" sx={{ fontSize: '10px' }}>
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

          {selectedRewardSymbol === 'merit-all' && (
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
                        <FormattedNumber value={Number(meritReward.balance)} variant="secondary14" />
                        <Typography ml={1} variant="secondary14">
                          {meritReward.symbol}
                        </Typography>
                        <Typography ml={1} variant="caption" color="primary.main" sx={{ fontSize: '10px' }}>
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

          {selectedRewardSymbol === 'protocol-all' && (
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

          {selectedRewardSymbol !== 'all' && selectedRewardSymbol !== 'merit-all' && selectedRewardSymbol !== 'protocol-all' && (
            <DetailsNumberLineWithSub
              symbol={<TokenIcon symbol={selectedReward.symbol} />}
              futureValue={selectedReward.balance}
              futureValueUSD={selectedReward.balanceUsd}
              description={
                <Trans>
                  {selectedReward.symbol} Balance
                  {meritRewardsForSelect.some(r => r.symbol === selectedReward.symbol) && ' (Merit)'}
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
